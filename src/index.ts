/**
 * RoomService JavaScript SDK
 *
 * A simple, clean SDK for the RoomService gRPC API.
 * Build real-time multiplayer games and collaborative applications easily.
 */

// Main client
export {
  RoomServiceClient,
  RoomServiceStream,
} from './client/RoomServiceClient';

// Types
export type {
  RoomServiceClientOptions,
  RoomSnapshot,
  RoomInfo,
  User,
  DataEditMode,
  JoinOptions,
  RoomEvent,
  EventType,
} from './client/RoomServiceClient';

// Value helpers
export {
  stringValue,
  intValue,
  floatValue,
  boolValue,
  binaryValue,
  listValue,
  mapValue,
  toValue,
  fromValue,
} from './commands/helpers';

// Error handling
export {
  RoomServiceError,
  wrapGrpcError,
} from './utils/errors';

// Event handlers
export {
  parseEvent,
  parseRoomSnapshot,
  parseRoomsList,
  isRoomCreatedEvent,
  isRoomDeletedEvent,
  isJoinedRoomEvent,
  isLeftRoomEvent,
  isDataEditedEvent,
  isOwnerChangedEvent,
  isFullRoomSnapshotEvent,
  isErrorMessageEvent,
} from './events/handlers';

// Event types
export type {
  BaseEvent,
  RoomCreatedEvent,
  RoomDeletedEvent,
  JoinedRoomEvent,
  LeftRoomEvent,
  DataEditedEvent,
  OwnerChangedEvent,
  FullRoomSnapshotEvent,
  ErrorMessageEvent,
} from './events/types';
