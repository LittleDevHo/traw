import React from "react";
import { useTrawApp } from "../../hooks/useTrawApp";
import ToolBox from "../ToolBox";

import { SlideItem } from "./SlideItem";
import SlideList from "./SlideList";

const Slide = () => {
  const app = useTrawApp();
  const { appState } = app.useSlidesStore();
  const { activeTool } = appState;

  const handleAddSlide = () => {
    app.createSlide();
  };

  return (
    <div className="flex flex-1 items-center flex-col p-2">
      <div className="flex w-full bg-white rounded-2xl items-center px-4 mb-2 basis-[117px] pb-4 pt-4 ">
        <SlideList
          canAddSlide={true}
          handleAddSlide={handleAddSlide}
          handleGridView={console.log}
        />
      </div>

      <SlideItem />

      <div className="flex basis-[56px]">
        <ToolBox
          currentTool={activeTool}
          isUndoable={true}
          isRedoable={true}
          selectTool={console.log}
          handleUndo={console.log}
          handleRedo={console.log}
        />
      </div>
    </div>
  );
};

export { Slide };
