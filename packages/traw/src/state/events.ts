import { TRBlock, TRBlockVoice, TRCamera, TRRecord, TRViewMode } from 'types';
import { TldrawApp } from '@tldraw/tldraw';

export interface TrawBaseEvent {
  tldrawApp: TldrawApp;
}

/**
 * Event for newly created records
 *
 * Records added by TrawApp.addRecords will not trigger this event
 */
export interface CreateRecordsEvent extends TrawBaseEvent {
  records: TRRecord[];
}

export type CreateRecordsHandler = (event: CreateRecordsEvent) => void;

/**
 * Event for newly created block
 *
 * Block added by TrawApp.addBlocks will not trigger this event
 */
export interface CreateBlockEvent extends TrawBaseEvent {
  block: TRBlock;
}

export type CreateBlockHandler = (event: CreateBlockEvent) => void;

export type CreateBlockVoiceHandler = (event: CreateBlockVoiceEvent) => void;

/**
 * Event for update block text
 *
 */

export interface EditBlockEvent extends TrawBaseEvent {
  blockId: string;
  text?: string;
  captureUrl?: string;
}

export type EditBlockHandler = (event: EditBlockEvent) => void;

/**
 * Event for deactivate block
 *
 */

export interface DeleteBlockEvent extends TrawBaseEvent {
  blockId: string;
}

export type DeleteBlockHandler = (event: DeleteBlockEvent) => void;

export interface CreateBlockVoiceEvent extends TrawBaseEvent {
  voice: TRBlockVoice;
}

/**
 * Event triggered when TldrawApp is changed.
 */
export type TldrawAppChangeEvent = TrawBaseEvent;

export type TldrawAppChangeHandler = (event: TldrawAppChangeEvent) => void;

export interface PointerMoveEvent extends TrawBaseEvent {
  x: number;
  y: number;
}

export type PointerMoveHandler = (event: PointerMoveEvent) => void;

export interface CameraChangeEvent extends TrawBaseEvent {
  targetSlide: string;
  camera: TRCamera;
}

export type CameraChangeHandler = (event: CameraChangeEvent) => void;

/**
 * Event triggered when the view mode is changed
 */
export interface ChangeViewModeEvent extends TrawBaseEvent {
  mode: TRViewMode;
}

export type ChangeViewModeHandler = (event: ChangeViewModeEvent) => void;

/**
 * Traw Event Types
 */
export enum TrawEventType {
  CreateRecords = 'createRecords',
  CreateBlock = 'createBlock',
  CreateBlockVoice = 'createBlockVoice',
  TldrawAppChange = 'tldrawAppChange',
  PointerMove = 'pointerMove',
  CameraChange = 'cameraChange',
  EditBlock = 'editBlock',
  DeleteBlock = 'deleteBlock',
  ChangeViewMode = 'changeViewMode',
}

/**
 * Map of event types to their handlers
 */
export interface EventTypeHandlerMap {
  [TrawEventType.CreateRecords]: CreateRecordsHandler;
  [TrawEventType.TldrawAppChange]: TldrawAppChangeHandler;
  [TrawEventType.PointerMove]: PointerMoveHandler;
  [TrawEventType.CameraChange]: CameraChangeHandler;
  [TrawEventType.CreateBlock]: CreateBlockHandler;
  [TrawEventType.CreateBlockVoice]: CreateBlockVoiceHandler;
  [TrawEventType.EditBlock]: EditBlockHandler;
  [TrawEventType.DeleteBlock]: DeleteBlockHandler;
  [TrawEventType.ChangeViewMode]: ChangeViewModeHandler;
}

/**
 * Union type of event handlers
 */
export type TrawEventHandler =
  | CreateRecordsHandler
  | TldrawAppChangeHandler
  | PointerMoveHandler
  | CameraChangeHandler
  | CreateBlockHandler
  | CreateBlockVoiceHandler
  | EditBlockHandler
  | DeleteBlockHandler
  | ChangeViewModeHandler;
