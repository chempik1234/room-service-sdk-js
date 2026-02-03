/**
 * Event parsing and type guards for RoomService
 */

import type { RoomEvent, RoomSnapshot } from './types';
import type { User } from '../commands/builders';
import { fromValue } from '../commands/helpers';

/**
 * Parse a gRPC event into a typed RoomEvent
 */
export function parseEvent(grpcEvent: any): RoomEvent {
  const base = {
    timestamp: grpcEvent.timestamp || 0,
    roomId: grpcEvent.roomId || '',
    userId: grpcEvent.userId || ''
  };

  // RoomCreated
  if (grpcEvent.roomCreated) {
    return {
      type: 'RoomCreated',
      ...base,
      roomId: grpcEvent.roomCreated.roomId || base.roomId,
      roomOptions: grpcEvent.roomCreated.roomOptions || {}
    };
  }

  // RoomDeleted
  if (grpcEvent.roomDeleted) {
    return {
      type: 'RoomDeleted',
      ...base,
      deletedRoomId: grpcEvent.roomDeleted.deletedRoomId || ''
    };
  }

  // JoinedRoom
  if (grpcEvent.joinedRoom) {
    const userFull = grpcEvent.joinedRoom.userFull || {};
    return {
      type: 'JoinedRoom',
      ...base,
      roomId: grpcEvent.joinedRoom.roomId || base.roomId,
      user: {
        id: userFull.id || '',
        name: userFull.name || '',
        metadata: userFull.metadata || {}
      }
    };
  }

  // LeftRoom
  if (grpcEvent.leftRoom) {
    return {
      type: 'LeftRoom',
      ...base,
      roomId: grpcEvent.leftRoom.roomId || base.roomId,
      kickedUserId: grpcEvent.leftRoom.kickedUserId || undefined
    };
  }

  // DataEdited
  if (grpcEvent.dataEdited) {
    const modeMap: Record<number, 'SET' | 'DELETE' | 'APPEND' | 'REMOVE'> = {
      0: 'SET',
      1: 'DELETE',
      2: 'APPEND',
      3: 'REMOVE'
    };
    return {
      type: 'DataEdited',
      ...base,
      roomId: grpcEvent.dataEdited.roomId || base.roomId,
      dataId: grpcEvent.dataEdited.dataId || '',
      value: grpcEvent.dataEdited.dataValue ? fromValue(grpcEvent.dataEdited.dataValue) : undefined,
      mode: modeMap[grpcEvent.dataEdited.commandMode] || 'SET'
    };
  }

  // OwnerChanged
  if (grpcEvent.ownerChanged) {
    return {
      type: 'OwnerChanged',
      ...base,
      newOwnerId: grpcEvent.ownerChanged.newOwnerId || '',
      ownerHasChanged: grpcEvent.ownerChanged.ownerHasChanged || false
    };
  }

  // FullRoomSnapshot
  if (grpcEvent.fullRoom) {
    const data: { [key: string]: any } = {};
    if (grpcEvent.fullRoom.room && grpcEvent.fullRoom.room.values) {
      for (const key in grpcEvent.fullRoom.room.values) {
        data[key] = fromValue(grpcEvent.fullRoom.room.values[key]);
      }
    }

    const users: User[] = (grpcEvent.fullRoom.users || []).map((u: any) => ({
      id: u.id || '',
      name: u.name || '',
      metadata: u.metadata || {}
    }));

    return {
      type: 'FullRoomSnapshot',
      ...base,
      roomId: grpcEvent.fullRoom.roomId || base.roomId,
      data,
      users,
      roomOptions: grpcEvent.fullRoom.roomOptions || {}
    };
  }

  // ErrorMessage
  if (grpcEvent.errorMessage) {
    return {
      type: 'ErrorMessage',
      ...base,
      error: grpcEvent.errorMessage.error || 'Unknown error'
    };
  }

  // Unknown event type - return as error
  return {
    type: 'ErrorMessage',
    ...base,
    error: `Unknown event type: ${JSON.stringify(grpcEvent)}`
  };
}

/**
 * Parse a room snapshot from gRPC
 */
export function parseRoomSnapshot(roomId: string, grpcEvent: any): RoomSnapshot {
  const data: { [key: string]: any } = {};
  if (grpcEvent.fullRoom && grpcEvent.fullRoom.room && grpcEvent.fullRoom.room.values) {
    for (const key in grpcEvent.fullRoom.room.values) {
      data[key] = fromValue(grpcEvent.fullRoom.room.values[key]);
    }
  }

  const users: User[] = (grpcEvent.fullRoom?.users || []).map((u: any) => ({
    id: u.id || '',
    name: u.name || '',
    metadata: u.metadata || {}
  }));

  return {
    roomId,
    roomOptions: grpcEvent.fullRoom?.roomOptions || {},
    data,
    users
  };
}

/**
 * Parse rooms list from gRPC
 */
export function parseRoomsList(grpcResponse: any): Array<{
  roomId: string;
  roomOwnerId: string;
  roomOptions: { [key: string]: string };
}> {
  if (!grpcResponse.rooms) {
    return [];
  }

  return grpcResponse.rooms.map((room: any) => ({
    roomId: room.roomId || '',
    roomOwnerId: room.roomOwnerId || '',
    roomOptions: room.roomOptions || {}
  }));
}

/**
 * Type guard for RoomCreatedEvent
 */
export function isRoomCreatedEvent(event: RoomEvent): event is Extract<RoomEvent, { type: 'RoomCreated' }> {
  return event.type === 'RoomCreated';
}

/**
 * Type guard for RoomDeletedEvent
 */
export function isRoomDeletedEvent(event: RoomEvent): event is Extract<RoomEvent, { type: 'RoomDeleted' }> {
  return event.type === 'RoomDeleted';
}

/**
 * Type guard for JoinedRoomEvent
 */
export function isJoinedRoomEvent(event: RoomEvent): event is Extract<RoomEvent, { type: 'JoinedRoom' }> {
  return event.type === 'JoinedRoom';
}

/**
 * Type guard for LeftRoomEvent
 */
export function isLeftRoomEvent(event: RoomEvent): event is Extract<RoomEvent, { type: 'LeftRoom' }> {
  return event.type === 'LeftRoom';
}

/**
 * Type guard for DataEditedEvent
 */
export function isDataEditedEvent(event: RoomEvent): event is Extract<RoomEvent, { type: 'DataEdited' }> {
  return event.type === 'DataEdited';
}

/**
 * Type guard for OwnerChangedEvent
 */
export function isOwnerChangedEvent(event: RoomEvent): event is Extract<RoomEvent, { type: 'OwnerChanged' }> {
  return event.type === 'OwnerChanged';
}

/**
 * Type guard for FullRoomSnapshotEvent
 */
export function isFullRoomSnapshotEvent(event: RoomEvent): event is Extract<RoomEvent, { type: 'FullRoomSnapshot' }> {
  return event.type === 'FullRoomSnapshot';
}

/**
 * Type guard for ErrorMessageEvent
 */
export function isErrorMessageEvent(event: RoomEvent): event is Extract<RoomEvent, { type: 'ErrorMessage' }> {
  return event.type === 'ErrorMessage';
}
