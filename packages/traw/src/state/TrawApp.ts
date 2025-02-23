import {
  TDAsset,
  TDExportType,
  TDShapeType,
  TDToolType,
  TDUser,
  TLDR,
  TldrawApp,
  TldrawCommand,
  TldrawPatch,
} from '@tldraw/tldraw';
import debounce from 'lodash/debounce';
import { nanoid } from 'nanoid';
import { mountStoreDevtool } from 'simple-zustand-devtools';
import {
  ActionType,
  AnimationType,
  defaultPlayerOptions,
  PlayModeType,
  TDCamera,
  TrawRoomUser,
  TrawSnapshot,
  TrawUser,
  TRBlock,
  TRBlockType,
  TRBlockVoice,
  TRCamera,
  TREditorPadding,
  TRRecord,
  TRViewMode,
  TRViewport,
} from 'types';
import createVanilla, { StoreApi } from 'zustand/vanilla';
import { DEFAULT_CAMERA, DELETE_ID, SLIDE_HEIGHT, SLIDE_RATIO, SLIDE_WIDTH } from '../constants';

import { TLBounds } from '@tldraw/core';
import { Vec } from '@tldraw/vec';
import { Howl } from 'howler';
import produce from 'immer';
import { cloneDeepWith } from 'lodash';
import { TrawRecorder } from 'recorder/TrawRecorder';
import { CreateRecordsEvent, EventTypeHandlerMap, TrawEventHandler, TrawEventType } from 'state/events';
import { encodeFile } from 'utils/base64';
import { getCommonBounds, getImageForSvg, isChrome } from 'utils/common';
import create, { UseBoundStore } from 'zustand';
import { TrawAppOptions } from './TrawAppOptions';

export const convertCameraTRtoTD = (camera: TRCamera, viewport: TRViewport, padding?: TREditorPadding): TDCamera => {
  const { right } = padding || { right: 0 };
  const ratio = (viewport.width - right) / viewport.height;
  if (ratio > SLIDE_RATIO) {
    // wider than slide
    const absoluteHeight = SLIDE_HEIGHT / camera.zoom;
    const zoom = viewport.height / absoluteHeight;
    return {
      point: [-camera.center.x + (viewport.width - right) / zoom / 2, -camera.center.y + viewport.height / zoom / 2],
      zoom,
    };
  } else {
    // taller than slide
    const absoluteWidth = SLIDE_WIDTH / camera.zoom;
    const zoom = (viewport.width - right) / absoluteWidth;
    return {
      point: [-camera.center.x + (viewport.width - right) / zoom / 2, -camera.center.y + viewport.height / zoom / 2],
      zoom: zoom,
    };
  }
};

export const convertCameraTDtoTR = (camera: TDCamera, viewport: TRViewport, padding?: TREditorPadding): TRCamera => {
  const { right } = padding || { right: 0 };
  const ratio = (viewport.width - right) / viewport.height;
  if (ratio > SLIDE_RATIO) {
    // wider than slide
    const absoluteHeight = viewport.height / camera.zoom;
    const zoom = SLIDE_HEIGHT / absoluteHeight;
    return {
      center: {
        x: -camera.point[0] + (viewport.width - right) / camera.zoom / 2,
        y: -camera.point[1] + viewport.height / camera.zoom / 2,
      },
      zoom,
    };
  } else {
    // taller than slide
    const absoluteWidth = (viewport.width - right) / camera.zoom;
    const zoom = SLIDE_WIDTH / absoluteWidth;
    return {
      center: {
        x: -camera.point[0] + (viewport.width - right) / camera.zoom / 2,
        y: -camera.point[1] + viewport.height / camera.zoom / 2,
      },
      zoom: zoom,
    };
  }
};

export class TrawDrawApp extends TldrawApp {
  /**
   * Move backward in the undo/redo stack.
   */
  getStack = () => {
    return {
      stack: this.stack,
      pointer: this.pointer,
    };
  };
}

export class TrawApp {
  /**
   * The Tldraw app. (https://tldraw.com)
   * This is used to create and edit slides.
   */
  app: TrawDrawApp;

  editorId: string;

  viewportSize = {
    width: 0,
    height: 0,
  };

  /**
   * A zustand store that also holds the state.
   */
  private store: StoreApi<TrawSnapshot>;

  /**
   * The current state.
   */
  private _state: TrawSnapshot;

  protected pointer = 0;

  /**
   * Event handlers
   * @private
   */
  private eventHandlersMap = new Map<TrawEventType, TrawEventHandler[]>();

  /**
   * The time the current action started.
   * This is used to calculate the duration of the record.
   */
  private _actionStartTime: number | undefined;

  /**
   * Traw recorder
   */
  private _trawRecorder?: TrawRecorder;

  /**
   * A React hook for accessing the zustand store.
   */
  public readonly useStore: UseBoundStore<StoreApi<TrawSnapshot>>;

  /**
   * Handle asset creation. Preprocess the file and upload it to the remote. Should return the asset URL.
   *
   * @returns - The asset URL
   */
  public onAssetCreate?: (app: TldrawApp, file: File, id: string) => Promise<string | false>;

  public requestMedia: ((app: TldrawApp, type: string) => void) | undefined;

  openAsset = (type?: string) => {
    if (this.requestMedia) {
      this.requestMedia(this.app, type ?? '');
    } else {
      this.app.openAsset();
    }
  };

  public requestUser?: (id: string) => Promise<TrawUser | undefined>;

  constructor({ user, document, records = [], speechRecognitionLanguage = 'ko-KR', playerOptions }: TrawAppOptions) {
    this.editorId = user.id;

    playerOptions = {
      ...defaultPlayerOptions,
      ...playerOptions,
    };

    const { isPlayerMode, autoPlay, mute } = playerOptions;

    const mode = autoPlay ? PlayModeType.PLAYING : isPlayerMode ? PlayModeType.PREPARE : PlayModeType.EDIT;

    const recordMap: Record<string, TRRecord> = {};
    records.forEach((record) => {
      recordMap[record.id] = record;
    });

    const isPanelOpen = !playerOptions?.isPlayerMode;
    this._state = {
      player: {
        mode,
        isLimit: false,
        start: 0,
        end: Infinity,
        current: 0,
        volume: mute ? 0 : 1,
        loop: !!playerOptions.loop,
        totalTime: 0,
        isDone: true,
        animations: {},
        speed: 1,
      },
      editor: {
        isPanelOpen,
        padding: { right: 0 },
        search: {
          isSearching: false,
          query: '',
        },
      },
      viewport: {
        width: 0,
        height: 0,
      },
      recording: {
        isRecording: false,
        isMuted: false,
        isTalking: false,
        speechRecognitionLanguage,
        recognizedText: '',
        startedAt: 0,
      },
      ui: {
        mode: TRViewMode.CANVAS,
      },
      camera: {
        [this.editorId]: {
          targetSlideId: 'page',
          cameras: {
            ['page']: DEFAULT_CAMERA,
          },
        },
      },
      user,
      document,
      records: recordMap,
      blocks: {},
      doc: {
        blockViewportMap: {},
        lastBlockMap: {},
      },
      users: {},
      playerOptions,
    };
    this.store = createVanilla<TrawSnapshot>(() => this._state);
    if (process.env.NODE_ENV === 'development') {
      mountStoreDevtool(`Traw Store - ${document.id}`, this.store);
    }

    this.useStore = create(this.store);

    this.app = new TrawDrawApp();

    this.registerApp(this.app);

    this.applyRecords();

    if (TrawRecorder.isSupported()) {
      this._trawRecorder = new TrawRecorder({
        speechRecognitionLanguage,
        onCreatingBlockUpdate: (text) => {
          this.store.setState(
            produce((state) => {
              state.recording.recognizedText = text;
            }),
          );
        },
        onBlockCreated: ({ blockId, lang, text, time, voiceStart, voiceEnd }) => {
          const block: TRBlock = {
            id: blockId,
            time,
            voiceStart,
            voiceEnd,
            lang,
            text,
            isActive: true,
            type: TRBlockType.TALK,
            userId: this.editorId,
            voices: [],
          };
          this.createBlock(block);
        },
        onVoiceCreated: async ({ voiceId, file, blockId, ext }) => {
          let url: string | false;
          if (this.onAssetCreate) {
            url = await this.onAssetCreate(this.app, file, voiceId);
          } else {
            url = await encodeFile(file);
          }

          if (url) {
            this.createBlockVoice(blockId, {
              blockId,
              voiceId,
              ext,
              url: url as string,
            });
          } else {
            console.log('Failed to get voice URL');
          }
        },
        onTalking: (isTalking: boolean) => {
          this.store.setState(
            produce((state: TrawSnapshot) => {
              state.recording.isTalking = isTalking;
            }),
          );
        },
      });
    }
  }

  registerApp(app: TrawDrawApp) {
    app.callbacks = {
      onCommand: this.recordCommand,
      onAssetCreate: this.handleAssetCreate,
      onPatch: this.onPatch,
      onChangePresence: this.onChangePresence,
      onUndo: this.handleUndo,
      onRedo: this.handleRedo,
      onSessionStart: this.setActionStartTime,
    };

    this.app = app;
    this.applyRecords();
    this.emit(TrawEventType.TldrawAppChange, { tldrawApp: app });
  }

  private convertUndefinedToDelete = function handleDel<T>(patch: T): T {
    return cloneDeepWith(patch, (value) => {
      if (value === undefined) {
        return DELETE_ID;
      }
    });
  };

  private convertDeleteToUndefined = function handleUndefined<T>(patch: T): T {
    function deepCopy(src: any) {
      const target: any = Array.isArray(src) ? [] : {};
      if (Array.isArray(src)) return src.map((v) => (v === DELETE_ID ? undefined : v));
      for (const key in src) {
        const v = src[key];
        if (v) {
          if (v === DELETE_ID) {
            target[key] = undefined;
          } else if (typeof v === 'object') {
            target[key] = deepCopy(v);
          } else {
            target[key] = v;
          }
        } else {
          target[key] = v;
        }
      }

      return target;
    }
    return deepCopy(patch);
  };

  private handleUndo = (app: TldrawApp) => {
    const trawDrawApp = app as TrawDrawApp;
    const { stack, pointer } = trawDrawApp.getStack();
    const command = stack[pointer + 1];
    if (!command) return;
    this.recordCommand(app, {
      id: 'edit',
      before: command.after,
      after: command.before,
    });
  };

  private handleRedo = (app: TldrawApp) => {
    const trawDrawApp = app as TrawDrawApp;
    const { stack, pointer } = trawDrawApp.getStack();
    const command = stack[pointer];
    if (!command) return;
    this.recordCommand(app, {
      id: 'edit',
      before: command.before,
      after: command.after,
    });
  };

  private onPatch = (app: TldrawApp, patch: TldrawPatch, reason?: string) => {
    if (reason === 'sync_camera') return;
    const pageStates = patch.document?.pageStates;
    const currentPageId = app.appState.currentPageId;
    if (pageStates && pageStates[currentPageId]) {
      const camera = pageStates[currentPageId]?.camera as TDCamera;
      if (camera) {
        this.handleCameraChange(camera);
      }
    }
  };

  updateViewportSize = (width: number, height: number) => {
    this.store.setState((state) => {
      return {
        ...state,
        viewport: {
          ...state.viewport,
          width,
          height,
        },
      };
    });
    this.syncCamera();
  };

  get padding() {
    const viewMode = this.store.getState().ui.mode;
    if (viewMode === TRViewMode.CANVAS) return this.store.getState().editor.padding;
    else
      return {
        right: 0,
      };
  }

  zoomToSelection = (customSelectedIds?: string[]) => {
    const FIT_TO_SCREEN_PADDING = 100;
    const { selectedIds, shapes } = this.app;
    const padding = this.padding;

    const selected = customSelectedIds || selectedIds;

    const selectedShapes = shapes.filter((shape) => selected.includes(shape.id));
    if (selectedShapes.length === 0) return this;
    const { rendererBounds } = this.app;

    const getExpandedBounds = function (a: TLBounds, b: TLBounds): TLBounds {
      const minX = Math.min(a.minX, b.minX);
      const minY = Math.min(a.minY, b.minY);
      const maxX = Math.max(a.maxX, b.maxX);
      const maxY = Math.max(a.maxY, b.maxY);
      const width = Math.abs(maxX - minX);
      const height = Math.abs(maxY - minY);

      return { minX, minY, maxX, maxY, width, height };
    };

    const getCommonBounds = function (bounds: TLBounds[]): TLBounds {
      if (bounds.length < 2) return bounds[0];

      let result = bounds[0];

      for (let i = 1; i < bounds.length; i++) {
        result = getExpandedBounds(result, bounds[i]);
      }

      return result;
    };

    const commonBounds = getCommonBounds(selectedShapes.map(TLDR.getBounds));
    const zoom = TLDR.getCameraZoom(
      Math.min(
        (rendererBounds.width - FIT_TO_SCREEN_PADDING - padding.right) / commonBounds.width,
        (rendererBounds.height - FIT_TO_SCREEN_PADDING) / commonBounds.height,
      ),
    );
    const mx = (rendererBounds.width - commonBounds.width * zoom) / 2 / zoom;
    const my = (rendererBounds.height - commonBounds.height * zoom) / 2 / zoom;
    return this.app.setCamera(
      Vec.toFixed(Vec.sub([mx, my], [commonBounds.minX + padding.right / 2 / zoom, commonBounds.minY])),
      zoom,
      `zoomed_to_selection`,
    );
  };

  zoomToFit = () => {
    const FIT_TO_SCREEN_PADDING = 100;
    const { shapes } = this.app;
    const padding = this.padding;

    if (shapes.length === 0) return this;
    const { rendererBounds } = this.app;

    const getExpandedBounds = function (a: TLBounds, b: TLBounds): TLBounds {
      const minX = Math.min(a.minX, b.minX);
      const minY = Math.min(a.minY, b.minY);
      const maxX = Math.max(a.maxX, b.maxX);
      const maxY = Math.max(a.maxY, b.maxY);
      const width = Math.abs(maxX - minX);
      const height = Math.abs(maxY - minY);

      return { minX, minY, maxX, maxY, width, height };
    };

    const getCommonBounds = function (bounds: TLBounds[]): TLBounds {
      if (bounds.length < 2) return bounds[0];

      let result = bounds[0];

      for (let i = 1; i < bounds.length; i++) {
        result = getExpandedBounds(result, bounds[i]);
      }

      return result;
    };

    const commonBounds = getCommonBounds(shapes.map(TLDR.getBounds));
    const zoom = TLDR.getCameraZoom(
      Math.min(
        (rendererBounds.width - FIT_TO_SCREEN_PADDING - padding.right) / commonBounds.width,
        (rendererBounds.height - FIT_TO_SCREEN_PADDING) / commonBounds.height,
      ),
    );
    const mx = (rendererBounds.width - commonBounds.width * zoom) / 2 / zoom;
    const my = (rendererBounds.height - commonBounds.height * zoom) / 2 / zoom;
    return this.app.setCamera(
      Vec.toFixed(Vec.sub([mx, my], [commonBounds.minX + padding.right / 2 / zoom, commonBounds.minY])),
      zoom,
      `zoomed_to_fit`,
    );
  };

  syncCamera = () => {
    const { viewport, camera, player } = this.store.getState();

    const { playAs } = player;
    const targetUserId = playAs || this.editorId;
    const cameraObj = camera[targetUserId];
    if (!cameraObj) return;
    const currentPageId = cameraObj.targetSlideId;
    if (!currentPageId) return;

    const padding = this.padding;

    if (currentPageId !== this.app.appState.currentPageId) {
      if (this.app.getPage(currentPageId) === undefined) return;
      this.app.patchState({
        appState: {
          currentPageId,
        },
      });
    }

    const trCamera = camera[targetUserId].cameras[currentPageId];
    if (!trCamera) return;

    const tdCamera = convertCameraTRtoTD(trCamera, viewport, padding);
    this.app.setCamera(tdCamera.point, tdCamera.zoom, 'sync_camera');
  };

  getCamera = (slideId: string) => {
    const { camera } = this.store.getState();
    return camera[this.editorId].cameras[slideId];
  };

  handleCameraChange = (camera: TDCamera) => {
    if (this.store.getState().viewport.width === 0) return;
    const trawCamera = convertCameraTDtoTR(camera, this.store.getState().viewport, this.padding);
    const currentPageId = this.app.appState.currentPageId;

    this.store.setState(
      produce((state) => {
        state.camera[this.editorId].cameras[currentPageId] = trawCamera;
      }),
    );

    if (this._actionStartTime === 0) {
      this._actionStartTime = Date.now();
    }
    this.handleCameraRecord(trawCamera);
    this.emit(TrawEventType.CameraChange, { tldrawApp: this.app, targetSlide: currentPageId, camera: trawCamera });
  };

  updateCameraFromOthers = (slideId: string, camera: TRCamera) => {
    this.store.setState(
      produce((state) => {
        state.camera[this.editorId].cameras[slideId] = camera;
        if (state.camera[this.editorId].targetSlideId !== slideId) {
          state.camera[this.editorId].targetSlideId = slideId;
        }
      }),
    );
    this.syncCamera();

    if (this._actionStartTime === 0) {
      this._actionStartTime = Date.now();
    }
    this.handleCameraRecord(camera);
  };

  handleCameraRecord = debounce((camera: TRCamera) => {
    const document = this.store.getState().document;
    const currentPageId = this.app.appState.currentPageId;
    // create record
    const record: TRRecord = {
      id: nanoid(),
      type: 'zoom',
      slideId: currentPageId,
      start: this._actionStartTime || Date.now(),
      end: Date.now(),
      user: this.editorId,
      data: {
        camera,
      },
      origin: document.id,
    };

    const createRecordsEvent: CreateRecordsEvent = {
      tldrawApp: this.app,
      records: [record],
    };
    this.emit(TrawEventType.CreateRecords, createRecordsEvent);
    this.store.setState(
      produce((state) => {
        state.records[record.id] = record;
      }),
    );
    this._actionStartTime = 0;
  }, 400);

  selectTool(tool: TDToolType) {
    this.app.selectTool(tool);
  }

  useSlidesStore() {
    return this.app.useStore();
  }

  useTldrawApp() {
    return this.app;
  }

  setActionStartTime = () => {
    this._actionStartTime = Date.now();
  };

  addUser = (user: TrawUser) => {
    this.store.setState(
      produce((state) => {
        state.users[user.id] = user;
      }),
    );
  };

  protected recordCommand = (app: TldrawApp, command: TldrawCommand) => {
    const user = this.store.getState().user;
    const document = this.store.getState().document;
    const records: TRRecord[] = [];
    switch (command.id) {
      case 'change_page':
        if (command.after.appState)
          records.push({
            type: command.id,
            id: nanoid(),
            user: user.id,
            data: {
              id: command.after.appState.currentPageId,
            },
            start: Date.now(),
            end: Date.now(),
            origin: document.id,
          });
        break;
      case 'create_page': {
        if (!command.after.document || !command.after.document.pages) break;
        const pageId = Object.keys(command.after.document.pages)[0];
        records.push({
          type: command.id,
          id: nanoid(),
          user: user.id,
          data: {
            id: pageId,
          },
          start: Date.now() - 1, // Create page must be before select page
          end: Date.now() - 1,
          origin: document.id,
        });
        records.push({
          type: 'change_page',
          id: nanoid(),
          user: user.id,
          data: {
            id: pageId,
          },
          start: Date.now(),
          end: Date.now(),
          origin: document.id,
        });
        break;
      }
      case 'delete_page':
        break;
      case 'erase':
      case 'delete':
      default: {
        const patch = this.convertUndefinedToDelete(command.after);
        if (!patch.document || !patch.document.pages) break;
        const pageId = Object.keys(patch.document.pages)[0];
        if (!pageId) break;

        const shapes = patch.document.pages[pageId]?.shapes;
        if (!shapes) break;

        const assetIds = Object.values(shapes)
          .map((shape) => shape?.assetId)
          .filter((assetId: string | undefined): assetId is string => !!assetId);

        const assets = app.assets
          .filter((asset) => assetIds.includes(asset.id))
          .reduce<{ [key: string]: TDAsset }>((acc, asset) => {
            acc[asset.id] = asset;
            return acc;
          }, {});

        const bindings = patch.document.pages[pageId]?.bindings;

        records.push({
          type: command.id as ActionType,
          id: nanoid(),
          user: user.id,
          data: bindings ? { shapes, assets, bindings } : { shapes, assets },
          slideId: pageId,
          start: this._actionStartTime || Date.now(),
          end: Date.now(),
          origin: document.id,
        });
        break;
      }
    }

    if (!records.length) return;

    const createRecordsEvent: CreateRecordsEvent = {
      tldrawApp: this.app,
      records,
    };
    this.emit(TrawEventType.CreateRecords, createRecordsEvent);

    this.store.setState(
      produce((state) => {
        records.forEach((record) => {
          state.records[record.id] = record;
        });
      }),
    );
    this._actionStartTime = 0;
    this.pointer += records.length;
  };

  /**
   * Add new records to the state and apply them to the current document without animations.
   *
   * It handles out-of-order records.
   * In example,
   * Timeline ---------------------------------------->
   * Existing        ^a   ^b        ^c     ^d
   * New                        ^e     ^f     ^g
   *
   * With the above timeline, c & d are later than e & f but already exist in the document.
   * In this case, we are going to apply from the earliest new record (which is e) to the end (which is g).
   * In result, the document will be patched with e, c, f, d, g.
   *
   * @param records
   */
  addRecords = (records: TRRecord[]) => {
    // New records in ascending order
    const newRecords = records
      .filter((record) => !this.store.getState().records[record.id])
      .sort((a, b) => a.start - b.start);

    // Nothing to apply
    if (newRecords.length === 0) {
      return;
    }

    // Find the index of the first record(c) that is same or later than the first new record(e)
    const indexApplyFrom = this.sortedRecords.findIndex((record) => record.start >= newRecords[0].start);

    // If new records are out-of-order, rewind the pointer to the point that we need to reapply
    if (indexApplyFrom > -1) {
      this.pointer = indexApplyFrom;
    }

    this.store.setState(
      produce((state) => {
        newRecords.forEach((record) => {
          state.records[record.id] = record;
        });
      }),
    );
    this.applyRecords();
  };

  get sortedRecords() {
    return Object.values(this.store.getState().records).sort((a, b) => a.start - b.start);
  }

  private _sortedBlocks: TRBlock[] | undefined;

  clearCachedSortedBlocks = () => {
    this._sortedBlocks = undefined;
  };

  get sortedBlocks() {
    if (this._sortedBlocks) {
      // Cache hit
      return this._sortedBlocks;
    }

    // Cache miss
    const sortedBlocks = Object.values(this.store.getState().blocks)
      .filter((block) => block.isActive && block.type === 'TALK')
      .sort((a, b) => a.time - b.time);

    this._sortedBlocks = sortedBlocks;

    return sortedBlocks;
  }

  reloadRecords = () => {
    this.app.resetDocument();
    this.pointer = 0;
    this.applyRecords();
  };

  /**
   * Apply records to the current document.
   * It is stateful and will apply records from the current pointer to the endIndex.
   * @param endIndex Apply records until the endIndex (inclusive). Default is applying until the last record.
   * @param animation
   */
  applyRecords = (endIndex?: number, animation?: { current: number }) => {
    const sortedRecords = this.sortedRecords;

    // Inclusive index
    let start = this.pointer;
    const end = endIndex ?? sortedRecords.length - 1;

    if (endIndex !== undefined && endIndex + 1 < start) {
      // Play from the back
      this.app.resetDocument();
      start = 0;
    }

    // The second parameter of slice is exclusive
    const records = sortedRecords.slice(start, end + 1);
    const isCameraChanged = this.patchRecords(records, animation);

    if (animation) this.applyAnimation();

    this.removeDefaultPage();

    // Store last applied index
    this.pointer = end + 1;

    if (isCameraChanged) {
      this.syncCamera();
    }
  };

  private patchRecords(records: TRRecord[], animation?: { current: number }): boolean {
    let isCameraChanged = false;
    records.forEach((record) => {
      switch (record.type) {
        case 'create_page':
          this.app.patchState({
            document: {
              pageStates: {
                [record.data.id]: {
                  id: record.data.id,
                  selectedIds: [],
                  camera: { point: [0, 0], zoom: 1 },
                },
              },
              pages: {
                [record.data.id]: {
                  id: record.data.id,
                  name: 'Page',
                  childIndex: 2,
                  shapes: {},
                  bindings: {},
                },
              },
            },
          });
          this.store.setState(
            produce((state) => {
              if (state.camera[record.user]) {
                state.camera[record.user].cameras[record.data.id] = DEFAULT_CAMERA;
              } else {
                state.camera[record.user] = {
                  targetSlideId: record.data.id,
                  cameras: {
                    [record.data.id]: DEFAULT_CAMERA,
                  },
                };
              }
              state.camera[this.editorId].cameras[record.data.id] = DEFAULT_CAMERA;
            }),
          );
          isCameraChanged = true;
          break;
        case 'change_page':
          this.store.setState(
            produce((state) => {
              if (state.camera[record.user]) {
                state.camera[record.user].targetSlideId = record.data.id;
              } else {
                state.camera[record.user] = {
                  targetSlideId: record.data.id,
                  cameras: {
                    [record.data.id]: DEFAULT_CAMERA,
                  },
                };
              }
            }),
          );
          if (this.editorId === record.user) {
            isCameraChanged = true;
          }
          break;
        case 'delete_page':
          this.app.patchState({
            document: {
              pageStates: {
                [record.data.id]: undefined,
              },
              pages: {
                [record.data.id]: undefined,
              },
            },
          });
          break;
        case 'zoom':
          if (!record.slideId) break;
          if (!this.app.state.document.pageStates[record.slideId]) break;
          this.store.setState(
            produce((state) => {
              if (state.camera[record.user]) {
                state.camera[record.user].cameras = {
                  ...state.camera[record.user].cameras,
                  [record.slideId || '']: record.data.camera,
                };
              } else {
                state.camera[record.user] = {
                  targetSlideId: record.slideId,
                  cameras: {
                    [record.slideId || '']: record.data.camera,
                  },
                };
              }
            }),
          );
          isCameraChanged = true;
          break;
        default: {
          const { data, slideId } = record;
          if (!slideId) break;

          if (this.app.selectedIds) {
            // deselect deleted shapes
            const nextIds = this.app.selectedIds.filter((id) => record.data.shapes[id] !== DELETE_ID);
            if (this.app.selectedIds.length !== nextIds.length) {
              this.app.patchState(
                {
                  document: {
                    pageStates: {
                      [this.app.currentPageId]: {
                        selectedIds: nextIds,
                      },
                    },
                  },
                },
                `selected`,
              );
            }
          }

          if (animation && record.type === 'create_draw') {
            // Add path animation
            if (animation.current > record.start && animation.current < record.end) {
              const shapeId = Object.keys(record.data.shapes)[0];
              this.store.setState(
                produce((state) => {
                  state.player.animations = {
                    ...state.player.animations,
                    [shapeId]: {
                      type: AnimationType.DRAW,
                      start: Date.now(),
                      end: Date.now() + (record.end - record.start),
                      points: record.data.shapes[shapeId].points,
                      point: record.data.shapes[shapeId].point,
                      page: record.slideId,
                    },
                  };
                }),
              );
            }
          }

          if (data.bindings) {
            this.app.patchState({
              document: {
                pages: {
                  [slideId]: {
                    shapes: {
                      ...this.convertDeleteToUndefined(data.shapes),
                    },
                    bindings: data.bindings ? { ...this.convertDeleteToUndefined(data.bindings) } : undefined,
                  },
                },
                assets: {
                  ...this.convertDeleteToUndefined(data.assets),
                },
              },
            });
          } else {
            this.app.patchState({
              document: {
                pages: {
                  [slideId]: {
                    shapes: {
                      ...this.convertDeleteToUndefined(data.shapes),
                    },
                  },
                },
                assets: {
                  ...this.convertDeleteToUndefined(data.assets),
                },
              },
            });
          }
          break;
        }
      }
    });
    return isCameraChanged;
  }

  private applyAnimation = () => {
    const animations = this.store.getState().player.animations;
    if (Object.keys(animations).length === 0) return;
    const animationIds = Object.keys(animations);
    animationIds.forEach((id) => {
      const animation = animations[id];
      const progress = (Date.now() - animation.start) / (animation.end - animation.start);
      const page = this.app.getPage(animation.page);
      if (progress < 1 && page && page.shapes[id]) {
        if (animation.type === AnimationType.DRAW) {
          const subPoints = animation.points?.slice(0, Math.max(animation.points.length * progress, 1));
          let minY = Infinity;
          let minX = Infinity;
          subPoints?.forEach(([x, y]) => {
            if (x < minX) minX = x;
            if (y < minY) minY = y;
          });
          this.app.patchState({
            document: {
              pages: {
                [animation.page]: {
                  shapes: {
                    [id]: {
                      points: subPoints?.map(([x, y, z]) => [x - minX, y - minY, z]),
                      point: [animation.point[0] + minX, animation.point[1] + minY],
                    },
                  },
                },
              },
            },
          });
        }
      } else {
        this.store.setState(
          produce((state) => {
            delete state.player.animations[id];
          }),
        );
      }
    });
  };

  private removeDefaultPage = () => {
    if (this.app.document.pageStates.page && Object.keys(this.app.document.pageStates).length > 1) {
      if (this.app.state.appState.currentPageId === 'page') {
        this.app.patchState({
          appState: {
            currentPageId: Object.keys(this.app.document.pageStates).filter((p) => p !== 'page')[0],
          },
        });
      }
      this.app.patchState({
        document: {
          pageStates: {
            page: undefined,
          },
          pages: {
            page: undefined,
          },
        },
      });
    }
    if (this._state.camera[this.editorId].cameras.page) {
      this.store.setState(
        produce((state) => {
          if (state.camera[this.editorId].targetSlideId === 'page')
            state.camera[this.editorId].targetSlideId = Object.keys(this.app.document.pageStates)[0];
          delete state.camera[this.editorId].cameras.page;
        }),
      );
    }
  };

  // setCamera = (camera: TDCamera, slideId: string) => {};

  createSlide = () => {
    const pageId = nanoid();
    this.store.setState(
      produce((state) => {
        state.camera[this.editorId].targetSlideId = pageId;
        state.camera[this.editorId].cameras[pageId] = DEFAULT_CAMERA;
      }),
    );
    this.app.createPage(pageId);
    this.syncCamera();
  };

  deleteSlide = () => {
    this.app.deletePage();
  };

  selectSlide = (id: string) => {
    this.store.setState(
      produce((state) => {
        state.camera[this.editorId].targetSlideId = id;
      }),
    );
    this.app.changePage(id);
    this.syncCamera();
  };

  startRecording = async (): Promise<void> => {
    if (!this._trawRecorder) return;

    await this._trawRecorder.startRecording();

    this.store.setState(
      produce((state: TrawSnapshot) => {
        state.recording.isRecording = true;
        state.recording.startedAt = Date.now();
      }),
    );
  };

  stopRecording = () => {
    if (!this._trawRecorder) return;

    this._trawRecorder?.stopRecording();
    this.store.setState(
      produce((state: TrawSnapshot) => {
        state.recording.isRecording = false;
        state.recording.startedAt = 0;
      }),
    );
  };

  mute = () => {
    this._trawRecorder?.mute();
    this.store.setState(
      produce((state: TrawSnapshot) => {
        state.recording.isMuted = true;
      }),
    );
  };

  unmute = () => {
    this._trawRecorder?.unmute();
    this.store.setState(
      produce((state: TrawSnapshot) => {
        state.recording.isMuted = false;
      }),
    );
  };

  setSpeechRecognitionLanguage = (lang: string) => {
    this._trawRecorder?.changeSpeechRecognitionLanguage(lang);
    this.store.setState(
      produce((state: TrawSnapshot) => {
        state.recording.speechRecognitionLanguage = lang;
      }),
    );
  };

  private handleAssetCreate = async (app: TldrawApp, file: File, id: string): Promise<string | false> => {
    if (this.onAssetCreate) {
      return await this.onAssetCreate(app, file, id);
    }
    return false;
  };

  /*
   * Realtime room
   */
  private onChangePresence = (tldrawApp: TldrawApp, presence: TDUser) => {
    const [x, y] = presence.point;
    this.emit(TrawEventType.PointerMove, { tldrawApp, x, y });
  };

  public readonly initializeRoom = (roomId: string, color: string) => {
    this.app.patchState({
      room: {
        id: roomId,
        userId: this.editorId,
        users: {
          [this.editorId]: {
            id: this.editorId,
            color,
            point: [100, 100],
            selectedIds: [],
            activeShapes: [],
          },
        },
      },
    });

    this.store.setState(
      produce((state) => {
        state.room = {
          id: roomId,
        };
      }),
    );
  };

  public readonly updateOthers = (tdOthers: TDUser[], trawOthers: TrawRoomUser[]) => {
    this.app.patchState({
      room: {
        users: Object.fromEntries(tdOthers.map((user) => [user.id, user])),
      },
    });

    this.store.setState(
      produce((state) => {
        state.room = {
          others: Object.fromEntries(trawOthers.map((user) => [user.id, { page: user.page }])),
        };
      }),
    );
  };

  createBlock = (block: TRBlock) => {
    this.clearCachedSortedBlocks();

    this.store.setState(
      produce((state) => {
        state.blocks[block.id] = block;
      }),
    );
    this.emit(TrawEventType.CreateBlock, { tldrawApp: this.app, block });
  };

  createBlockVoice = (blockId: string, voice: TRBlockVoice) => {
    this.store.setState((state) =>
      produce(state, (draft) => {
        draft.blocks[blockId]?.voices.push(voice);
      }),
    );
    this.emit(TrawEventType.CreateBlockVoice, { tldrawApp: this.app, voice });
  };

  addBlocks = (blocks: TRBlock[]) => {
    this.clearCachedSortedBlocks();
    let totalTime = 0;
    this.store.setState(
      produce((state) => {
        blocks.forEach((block) => {
          state.blocks[block.id] = block;
          if (block.isActive && block.type === 'TALK') totalTime += block.voiceEnd - block.voiceStart;
        });
        state.player.totalTime = totalTime;
      }),
    );

    const autoPlay = this.store.getState().playerOptions.autoPlay;

    if (autoPlay) {
      this.playFromFirstBlock();
    }
  };

  editBlock = (blockId: string, text: string) => {
    this.clearCachedSortedBlocks();

    this.store.setState(
      produce((state) => {
        state.blocks[blockId] = { ...state.blocks[blockId], text };
      }),
    );
    this.emit(TrawEventType.EditBlock, { tldrawApp: this.app, blockId, text });
  };

  deleteBlock = (blockId: string) => {
    this.clearCachedSortedBlocks();
    this.store.setState(
      produce((state) => {
        state.blocks[blockId] = { ...state.blocks[blockId], isActive: false };

        state.player.totalTime -= state.blocks[blockId].voiceEnd - state.blocks[blockId].voiceStart;
      }),
    );
    this.emit(TrawEventType.DeleteBlock, { tldrawApp: this.app, blockId });
  };

  public getPlayableVoice = (block: TRBlock | undefined): TRBlockVoice | undefined => {
    if (!block || block.voices.length === 0) return undefined;

    const mp3Voice = block.voices.find(({ ext }) => ext === 'mp3');
    if (mp3Voice) {
      return mp3Voice;
    }

    const webmVoice = block.voices.find(({ ext }) => ext === 'webm');
    const mp4Voice = block.voices.find(({ ext }) => ext === 'mp4');
    if (isChrome()) {
      return webmVoice ?? mp4Voice;
    }
    return mp4Voice;
  };

  private audioInstance: Howl | undefined;

  private applyRecordsToTime = (time: number) => {
    const records = this.sortedRecords.filter((r) => r.start <= time);

    const endIndex = records.filter((r) => r.start <= time).length - 1;

    if (endIndex < 0) return;
    this.applyRecords(endIndex, { current: time });
  };

  public setSpeed = (speed: number) => {
    this.store.setState(
      produce((state) => {
        state.player.speed = speed;
      }),
    );
    const targetBlock = this.store.getState().player.targetBlockId;
    if (targetBlock) {
      this.playBlock(targetBlock);
    }
  };

  public playBlock(blockId: string) {
    const block = this.store.getState().blocks[blockId || ''];
    if (!block) return;

    const playableVoice = this.getPlayableVoice(block);
    const nextBlock = this._getNextBlock(blockId);
    if (nextBlock) {
      const nextBlockPlayableVoice = this.getPlayableVoice(nextBlock);
      if (nextBlockPlayableVoice) {
        // preload the next block
        this.preloadBlock(nextBlockPlayableVoice);
      }
    }

    if (playableVoice) {
      // Play current
      this.playBlockAudio(block, playableVoice);
    } else if (nextBlock) {
      // Play next
      this.playBlock(nextBlock.id);
    }
  }

  private voiceIdToHowlMap = new Map<string, Howl>();

  private preloadBlock(playableVoice: TRBlockVoice) {
    if (this.voiceIdToHowlMap.has(playableVoice.voiceId)) {
      return;
    } else {
      const howl = new Howl({
        src: [playableVoice.url],
        format: playableVoice.ext,
        html5: true,
        preload: true,
        autoplay: false,
      });
      this.voiceIdToHowlMap.set(playableVoice.voiceId, howl);
    }
  }

  private playBlockAudio(block: TRBlock, playableVoice: TRBlockVoice) {
    if (this.audioInstance) {
      this.audioInstance.stop();
    }

    const { speed, volume } = this.store.getState().player;

    // Get or create a howl object
    const howl =
      this.voiceIdToHowlMap.get(playableVoice.voiceId) ??
      new Howl({
        src: [playableVoice.url],
        format: playableVoice.ext,
        html5: true,
        volume,
      });
    this.voiceIdToHowlMap.set(playableVoice.voiceId, howl);

    // Set play attributes
    howl.seek(block.voiceStart / 1000);
    howl.rate(speed);

    // Remove the old listener
    howl.off('load');
    howl.off('play');

    // Set the new listener
    howl.on('load', () => {
      const mode = this.store.getState().player.mode;
      if (mode === PlayModeType.LOADING || mode === PlayModeType.PLAYING) {
        howl.play();
      }
    });
    howl.on('play', () => {
      this.store.setState(
        produce((state) => {
          state.player = {
            ...state.player,
            targetBlockId: block.id,
            mode: PlayModeType.PLAYING,
            playAs: block.userId,
            start: Date.now(),
            end: Date.now() + (block.voiceEnd - block.voiceStart) / speed,
            isDone: false,
          };
        }),
      );
      this._handlePlay();
    });

    // Play
    const state = howl.state();
    if (state === 'loaded') {
      howl.play();
    } else {
      if (state === 'unloaded') {
        howl.load();
      }
      this.store.setState(
        produce((state) => {
          state.player = {
            ...state.player,
            mode: PlayModeType.LOADING,
            isLoading: true,
            targetBlockId: block.id,
            playAs: block.userId,
            start: Date.now(),
            end: Date.now() + (block.voiceEnd - block.voiceStart) / speed,
            isDone: false,
          };
        }),
      );
    }
    this.audioInstance = howl;
  }

  public playFromFirstBlock = () => {
    const blocks = this.sortedBlocks;
    if (blocks.length === 0) return;
    const firstBlock = blocks[0];
    this.playBlock(firstBlock.id);
  };

  public pause = () => {
    if (this.audioInstance) {
      this.audioInstance.pause();
    }
    this.store.setState(
      produce((state) => {
        state.player = {
          ...state.player,
          mode: PlayModeType.PAUSE,
          current: Date.now() - state.player.start,
          loop: false,
        };
      }),
    );
  };

  public togglePlay = () => {
    const { mode } = this.store.getState().player;
    if (mode === PlayModeType.PLAYING) {
      this.pause();
    } else {
      this.resume();
    }
  };

  public resume = () => {
    if (this.audioInstance) {
      this.audioInstance.play();
    }
    this.store.setState(
      produce((state) => {
        state.player = {
          ...state.player,
          mode: PlayModeType.PLAYING,
          start: Date.now() - state.player.current,
          end: Date.now() + (state.player.end - state.player.start - state.player.current),
        };
      }),
    );
    this._handlePlay();
  };

  private playInterval: number | undefined;

  private stopPlay = () => {
    if (this.playInterval) cancelAnimationFrame(this.playInterval);
    if (this.audioInstance) {
      this.audioInstance.stop();
    }

    this.store.setState(
      produce((state) => {
        state.player = {
          ...state.player,
          mode: PlayModeType.STOP,
          isLimit: false,
          start: 0,
          current: 0,
          loop: false,
          playAs: undefined,
          isDone: true,
        };
      }),
    );

    this.applyRecords();
  };

  private _getNextBlock = (blockId: string): TRBlock | undefined => {
    const sortedBlocks = this.sortedBlocks;
    const index = sortedBlocks.findIndex((b) => b.id === blockId);
    return sortedBlocks[index + 1];
  };

  private _handlePlay = () => {
    const { player } = this.store.getState();
    if (player.mode !== PlayModeType.PLAYING) {
      if (this.playInterval) cancelAnimationFrame(this.playInterval);
      return;
    } else {
      if (player.end < Date.now()) {
        // play next block
        if (!player.isLimit) {
          const nextBlock = this._getNextBlock(player.targetBlockId || '');
          if (nextBlock) {
            this.playBlock(nextBlock.id);
          } else {
            if (player.loop) {
              this.playFromFirstBlock();
            } else {
              this.stopPlay();
            }
          }
        } else {
          this.stopPlay();
        }

        return;
      } else {
        // update to current time
        const speed = this.store.getState().player.speed;
        const fromBlockStart = (Date.now() - player.start) * speed;
        const targetBlock = this.store.getState().blocks[player.targetBlockId || ''];
        if (!targetBlock) return;
        const currentTime = targetBlock.time + fromBlockStart;
        this.applyRecordsToTime(currentTime);

        this.playInterval = requestAnimationFrame(this._handlePlay);
        this.applyAnimation();
      }
    }
  };

  togglePanel = () => {
    this.store.setState(
      produce((state) => {
        const isPanelOpen = !state.editor.isPanelOpen;
        state.viewport = {
          ...state.viewport,
        };
        state.editor.isPanelOpen = isPanelOpen;
      }),
    );
    this.syncCamera();
  };

  setPadding = (padding: Partial<TREditorPadding>) => {
    this.store.setState(
      produce((state) => {
        state.editor.padding = {
          ...state.editor.padding,
          ...padding,
        };
      }),
    );
    this.syncCamera();
  };

  public backToEditor = () => {
    this.stopPlay();
    this.store.setState(
      produce((state) => {
        state.player.mode = PlayModeType.EDIT;
      }),
    );
  };

  /*
   * Event handlers
   */
  on<K extends TrawEventType>(eventType: K, handler: EventTypeHandlerMap[K]) {
    const handlers = this.eventHandlersMap.get(eventType) || [];
    handlers.push(handler);
    this.eventHandlersMap.set(eventType, handlers);
  }

  off<K extends keyof EventTypeHandlerMap>(eventType: K, handler: EventTypeHandlerMap[K]) {
    const handlers = this.eventHandlersMap.get(eventType) || [];
    this.eventHandlersMap.set(
      eventType,
      handlers.filter((h: TrawEventHandler) => h !== handler),
    );
  }

  private emit<K extends keyof EventTypeHandlerMap>(eventType: K, event: Parameters<EventTypeHandlerMap[K]>[0]) {
    const handlers = this.eventHandlersMap.get(eventType) || [];
    handlers.forEach((h: TrawEventHandler) => h(event as any));
  }

  startSearch = () => {
    this.store.setState(
      produce((state) => {
        state.editor.search.isSearching = true;
      }),
    );
  };

  setSearchQuery = (query: string) => {
    this.store.setState(
      produce((state) => {
        state.editor.search.isSearching = true;
        state.editor.search.query = query;
      }),
    );
  };

  endSearch = () => {
    this.store.setState(
      produce((state) => {
        state.editor.search.isSearching = false;
        state.editor.search.query = '';
      }),
    );
  };

  toggleViewMode = (mode: TRViewMode) => {
    this.store.setState(
      produce((state) => {
        state.ui.mode = mode;
      }),
    );

    this.emit(TrawEventType.ChangeViewMode, {
      tldrawApp: this.app,
      mode,
    });
  };

  updateDocModeData = () => {
    const sortedBlocks = this.sortedBlocks;
    const records = this.store.getState().records;
    const cameraRecords = Object.values(records)
      .filter((r) => r.type === 'zoom')
      .sort((a, b) => a.start - b.start);

    if (sortedBlocks.length === 0 || cameraRecords.length === 0) return;

    const blockViewportMap: Record<string, string> = {};
    const lastBlockMap: Record<string, string> = {};

    let pointer = 0;
    let currentCamera = cameraRecords[pointer];

    sortedBlocks.forEach((block) => {
      while (
        currentCamera &&
        currentCamera.end < block.time + block.voiceEnd - block.voiceStart &&
        cameraRecords[pointer + 1]
      ) {
        pointer++;
        currentCamera = cameraRecords[pointer];
      }

      blockViewportMap[block.id] = currentCamera?.id || '';
      lastBlockMap[currentCamera?.id || ''] = block.id;
    });

    this.store.setState(
      produce((state) => {
        state.doc.blockViewportMap = blockViewportMap;
        state.doc.lastBlockMap = lastBlockMap;
      }),
    );

    const lastBlocks = Object.values(lastBlockMap);
    setTimeout(() => {
      this.createBlockCaptures(lastBlocks);
    }, 0);
  };

  capturingBlocks: Record<string, boolean> = {};

  private captureCurrentViewport: (captureAs: string) => Promise<Blob> = async (captureAs) => {
    const tldrawApp = this.app;
    const shapeIds = tldrawApp.shapes.map((s) => s.id);

    const commonBounds = getCommonBounds(tldrawApp.shapes.map(TLDR.getRotatedBounds));

    const svg = await tldrawApp.getSvg(shapeIds, {
      includeFonts: true,
    });

    if (!svg) throw new Error('Failed to get svg');

    const { center, zoom } = this.store.getState().camera[captureAs].cameras[tldrawApp.currentPageId];

    const delta = {
      // tldraw's padding is 16
      x: commonBounds.minX - 16,
      y: commonBounds.minY - 16,
    };

    const bound = {
      width: SLIDE_WIDTH / zoom,
      height: SLIDE_HEIGHT / zoom,
      minX: center.x - SLIDE_WIDTH / 2 / zoom - delta.x,
      minY: center.y - SLIDE_HEIGHT / 2 / zoom - delta.y,
      maxX: center.x + SLIDE_WIDTH / 2 / zoom - delta.x,
      maxY: center.y + SLIDE_HEIGHT / 2 / zoom - delta.y,
    };

    const blob = await getImageForSvg(svg, TDExportType.WEBP, {
      scale: 2,
      quality: 1,
      bound,
    });
    if (!blob) throw new Error('Failed to get image');
    return blob;
  };

  private createCapture: (blockId: string) => Promise<string> = async (blockId) => {
    if (this.capturingBlocks[blockId]) return '';
    this.capturingBlocks[blockId] = true;
    const block = this.store.getState().blocks[blockId];
    if (!block) throw new Error('Block not found');
    if (block.captureUrl) return block.captureUrl;

    const records = this.sortedRecords;
    const filteredRecords = records.filter((record) => record.start <= block.time + block.voiceEnd - block.voiceStart);
    this.applyRecords(filteredRecords.length);

    const blob = await this.captureCurrentViewport(block.userId);

    const file = new File([blob], 'capture.webp', { type: 'image/webp' });

    if (!this.onAssetCreate) throw new Error('onAssetCreate is not defined');

    const url = await this.onAssetCreate(this.app, file, block.id + '-capture');

    if (!url) return '';

    this.store.setState(
      produce((state) => {
        state.blocks[block.id].captureUrl = url;
      }),
    );

    this.emit(TrawEventType.EditBlock, { tldrawApp: this.app, blockId: block.id, captureUrl: url });

    this.capturingBlocks[blockId] = false;
    return url;
  };

  private createBlockCaptures = async (blockIds: string[]) => {
    const blocks = this.store.getState().blocks;
    const filteredBlocks = Object.values(blocks)
      .filter((b) => blockIds.includes(b.id) && !b.captureUrl)
      .sort((a, b) => a.time - b.time);

    let index = 0;
    while (index < filteredBlocks.length) {
      const block = filteredBlocks[index];
      if (!block.captureUrl) await this.createCapture(block.id);

      index++;
    }
  };

  navigateFrame = (direction: 'next' | 'prev') => {
    const { shapes } = this.app;
    let currentFrame = this.store.getState().editor.currentFrame;
    const sortedShapes = shapes
      .filter((a) => a.type === TDShapeType.Image)
      .sort((a, b) => a.point[1] * 100 + a.point[0] - (b.point[1] * 100 + b.point[0]));

    if (currentFrame && !sortedShapes.filter((shape) => shape.id === currentFrame).length) currentFrame = undefined;

    let newFrame: string;
    if (!currentFrame) {
      newFrame = sortedShapes[0].id;
    } else {
      const currentIndex = sortedShapes.findIndex((shape) => shape.id === currentFrame);
      if (direction === 'next') {
        if (currentIndex < sortedShapes.length - 1) {
          newFrame = sortedShapes[currentIndex + 1].id;
        } else {
          newFrame = sortedShapes[0].id;
        }
      } else {
        if (currentIndex > 0) {
          newFrame = sortedShapes[currentIndex - 1].id;
        } else {
          newFrame = sortedShapes[sortedShapes.length - 1].id;
        }
      }
    }

    this.zoomToSelection([newFrame]);
    this.store.setState(
      produce((state) => {
        state.editor.currentFrame = newFrame;
      }),
    );
  };
}
