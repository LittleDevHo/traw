import React from "react";
import { useTrawApp } from "../../hooks/useTrawApp";
import SvgGridView from "../../icons/grid-view";
import SvgAdd from "../../icons/add";
import SlideListItem, { SlideListItemState } from "./SlideListItem";

interface SlideListProps {
  canAddSlide: boolean;
  handleAddSlide: () => void;
  handleGridView: () => void;
}
const SlideList = ({
  canAddSlide,
  handleAddSlide,
  handleGridView,
}: SlideListProps) => {
  const app = useTrawApp();
  const state = app.useSlidesStore();
  const { document, appState } = state;
  const { currentPageId } = appState;
  const pages = document.pages;

  const viewerCount = 3;
  const selectState = SlideListItemState.DEFAULT;

  return (
    <div className="flex flex-row gap-3 overflow-hidden justify-between flex-1">
      <div className="overflow-x-auto flex flex-1">
        <div className="flex flex-row gap-3">
          {Object.values(pages).map((page, index) => (
            <SlideListItem
              key={page.id}
              index={index + 1}
              page={page}
              viewerCount={viewerCount}
              selectState={
                page.id === currentPageId
                  ? SlideListItemState.SELECTED
                  : selectState
              }
            />
          ))}
        </div>
      </div>
      <div className="flex flex-col justify-between basis-[25px] sm:basis-[35px] py-1 sm:py-0">
        <button
          className="flex items-center justify-center border border-traw-purple w-6 h-6 sm:w-8 sm:h-8 rounded-md text-traw-purple
           disabled:border-black/[.12] disabled:text-black/[.26]"
          disabled={!canAddSlide}
          onClick={handleAddSlide}
        >
          <SvgAdd className="fill-current w-2 h-2" />
        </button>
        <button
          className="flex items-center justify-center border border-traw-purple w-6 h-6 sm:w-8 sm:h-8 rounded-md text-traw-purple "
          onClick={handleGridView}
        >
          <SvgGridView className="fill-current w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default SlideList;
