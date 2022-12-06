import { TldrawApp, TDToolType, TDShapeType } from "@tldraw/tldraw";
import createVanilla, { StoreApi } from "zustand/vanilla";
import { Record, TrawSnapshot } from "../types";

const ignoreFunc = () => {};

export class TrawCanvasApp extends TldrawApp {
  onZoom = ignoreFunc;
  onPan = ignoreFunc;

  constructor(id?: string, callbacks = {} as any) {
    super(id, callbacks);
  }
}

export class TrawApp {
  app: TrawCanvasApp;

  /**
   * A zustand store that also holds the state.
   */
  private store: StoreApi<TrawSnapshot>;

  /**
   * The current state.
   */
  private _state: TrawSnapshot;

  /**
   * The time the current action started.
   * This is used to calculate the duration of the record.
   */
  private _actionStartTime: number;

  constructor() {
    this.app = new TrawCanvasApp("", {
      onSessionStart: this.setActionStartTime,
    });
    console.log(this.app);
    this.selectTool(TDShapeType.Draw);

    this.app.onCommand = this.recordCommand;

    this._state = {
      records: [],
    };
    this.store = createVanilla(() => this._state);
  }

  selectTool(tool: TDToolType) {
    this.app.selectTool(tool);
  }

  useSlidesStore() {
    return this.app.useStore();
  }

  useTldrawApp() {
    return this.app;
  }

  setActionStartTime = (app, id) => {
    this._actionStartTime = Date.now();
  };

  recordCommand = (app, command) => {
    switch (command.id) {
      case "change_page":
        break;
      case "create_page":
        break;
      case "delete_page":
        break;
      default:
        const pageId = Object.keys(command.after.document.pages)[0];

        this.store.setState((state) => {
          return {
            ...state,
            records: [
              ...state.records,
              {
                type: command.id,
                data: command.after.document.pages[pageId],
                slideId: pageId,
                start: this._actionStartTime ? this._actionStartTime : 0,
                end: Date.now(),
              } as Record,
            ],
          };
        });
        this._actionStartTime = 0;
        console.log(this.store.getState());
        break;
    }
  };

  addRecord = (record: Record) => {
    console.log(record);
    const { type, data, slideId } = record;

    this.app.patchState({
      document: {
        pages: {
          [slideId]: data,
        },
      },
    });
  };

  createSlide = () => {
    this.app.createPage();
  };

  deleteSlide = () => {
    this.app.deletePage();
  };

  selectSlide = (id: string) => {
    this.app.changePage(id);
  };
}
