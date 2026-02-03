/**
 * Event type definitions for RoomService
 *
 * These types represent the events that can be received from RoomService.
 */

import type { User } from '../commands/builders';
import type { Value } from '../commands/helpers';

export type EventType =
  | 'RoomCreated'
  | 'RoomDeleted'
  | 'JoinedRoom'
  | 'LeftRoom'
  | 'DataEdited'
  | 'OwnerChanged'
  | 'FullRoomSnapshot'
  | 'ErrorMessage';

export interface BaseEvent {
  type: EventType;
  timestamp: number;
  roomId: string;
  userId: string;
}

export interface RoomCreatedEvent extends BaseEvent {
  type: 'RoomCreated';
  roomId: string;
  roomOptions: { [key: string]: string };
}

export interface RoomDeletedEvent extends BaseEvent {
  type: 'RoomDeleted';
  deletedRoomId: string;
}

export interface JoinedRoomEvent extends BaseEvent {
  type: 'JoinedRoom';
  roomId: string;
  user: User;
}

export interface LeftRoomEvent extends BaseEvent {
  type: 'LeftRoom';
  roomId: string;
  kickedUserId?: string;
}

export interface DataEditedEvent extends BaseEvent {
  type: 'DataEdited';
  roomId: string;
  dataId: string;
  value?: any;
  mode: 'SET' | 'DELETE' | 'APPEND' | 'REMOVE';
}

export interface OwnerChangedEvent extends BaseEvent {
  type: 'OwnerChanged';
  newOwnerId: string;
  ownerHasChanged: boolean;
}

export interface FullRoomSnapshotEvent extends BaseEvent {
  type: 'FullRoomSnapshot';
  roomId: string;
  data: { [key: string]: any };
  users: User[];
  roomOptions: { [key: string]: string };
}

export interface ErrorMessageEvent extends BaseEvent {
  type: 'ErrorMessage';
  error: string;
}

export type RoomEvent =
  | RoomCreatedEvent
  | RoomDeletedEvent
  | JoinedRoomEvent
  | LeftRoomEvent
  | DataEditedEvent
  | OwnerChangedEvent
  | FullRoomSnapshotEvent
  | ErrorMessageEvent;

/**
 * Room information (from RoomsList)
 */
export interface RoomInfo {
  roomId: string;
  roomOwnerId: string;
  roomOptions: { [key: string]: string };
}

/**
 * Full room snapshot (from getRoomSnapshot or FullRoomSnapshotEvent)
 */
export interface RoomSnapshot {
  roomId: string;
  roomOptions: { [key: string]: string };
  data: { [key: string]: any };
  users: User[];
}
