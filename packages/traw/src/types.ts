import { TDSnapshot, TDToolType } from '@tldraw/tldraw';

export type ActionType =
  | 'ADD'
  | 'REMOVE'
  | 'UPDATE'
  | 'ADD_SLIDE'
  | 'SORT_SLIDE'
  | 'DELETE_SLIDE'
  | 'SELECT_SLIDE'
  | 'SUBSCRIBE_SLIDE'
  | 'create_page'
  | 'change_page'
  | 'delete_page'
  | 'edit'
  | 'delete'
  | 'create_draw'
  | 'create'
  | 'zoom';

export type TrawToolInfo = {
  type: TDToolType | 'file';
  Icon: any;
  label: string;
  shortcut: (string | number)[];
};

export type TRRecord = {
  type: ActionType;
  data: any;
  id: string;
  slideId?: string;
  user: string;
  start: number;
  end: number;
  origin: string;
};

export type TDCamera = TDSnapshot['document']['pageStates']['page']['camera'];

export type TRViewport = {
  width: number;
  height: number;
};

export type TRCamera = {
  center: {
    x: number;
    y: number;
  };
  zoom: number;
};

export enum PlayModeType {
  EDIT = 'EDIT',
  PREPARE = 'PREPARE',
  PLAYING = 'PLAYING',
  LOADING = 'LOADING',
  PAUSE = 'PAUSE',
  STOP = 'STOP',
}

export enum AnimationType {
  DRAW = 'DRAW',
}

export type TREditorPadding = {
  right: number;
};

export enum TRViewMode {
  CANVAS = 'CANVAS',
  VIDEO = 'VIDEO',
  DOC = 'DOC',
}

export type TrawSnapshot = {
  player: {
    mode: PlayModeType;
    targetBlockId?: string;
    start: number;
    end: number;
    current: number;
    playAs?: string;
    isLimit: boolean;
    loop: boolean;
    volume: number;
    totalTime: number;
    isDone: boolean;
    speed: number;
    animations: {
      [shapeId: string]: {
        type: AnimationType;
        start: number;
        end: number;
        page: string;
        points?: [number, number, number][];
        point: [number, number];
      };
    };
  };
  editor: {
    isPanelOpen: boolean;
    padding: TREditorPadding;
    search: {
      isSearching: boolean;
      query: string;
    };
    currentFrame?: string;
  };
  ui: {
    mode: TRViewMode;
  };
  viewport: TRViewport;
  records: Record<string, TRRecord>;
  blocks: Record<string, TRBlock>;
  doc: {
    blockViewportMap: {
      // value string is recordId
      [blockId: string]: string;
    };
    lastBlockMap: {
      [recordId: string]: string;
    };
  };
  recording: {
    isRecording: boolean;
    isMuted: boolean;
    isTalking: boolean;
    speechRecognitionLanguage: string;
    recognizedText: string;
    startedAt: number;
  };
  currentFollowTarget?: string;
  camera: {
    [userId: string]: {
      targetSlideId: string;
      cameras: {
        [slideId: string]: TRCamera;
      };
    };
  };
  document: TrawDocument;
  user: TrawUser;
  users: {
    [userId: string]: TrawUser;
  };
  room?: TrawRoom;
  playerOptions: TrawPlayerOptions;
  // participants
};

export type TrawPlayerOptions = {
  isPlayerMode: boolean;
  mute?: boolean;
  loop?: boolean;
  autoPlay?: boolean;
  speed?: number;
};

export const defaultPlayerOptions: TrawPlayerOptions = {
  isPlayerMode: false,
  mute: false,
  loop: false,
  autoPlay: false,
};

export type TrawUser = {
  id: string;
  name: string;
  profileUrl?: string;
};

export type TrawDocument = {
  id: string;
  name: string;
  channelName: string;
  canEdit: boolean;
};

export interface TrawRoomUser {
  id: string;
  page: string;
}

export type TrawRoom = {
  id: string;
  others: {
    [userId: string]: TrawRoomUser;
  };
};

export enum TRBlockType {
  TALK = 'TALK',
  START_RECORDING = 'START_RECORDING',
  END_RECORDING = 'END_RECORDING',
}

export type TRBlock = {
  id: string;
  type: TRBlockType;
  userId: string;
  time: number;
  lang: string;
  text: string;
  isActive: boolean;
  voices: TRBlockVoice[];
  voiceStart: number;
  voiceEnd: number;
  captureUrl?: string;
};

export type TRBlockVoice = {
  blockId: string;
  voiceId: string;
  ext: string;
  url: string;
};
