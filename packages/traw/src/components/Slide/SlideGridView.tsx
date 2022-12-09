import React from "react";
import { TDPage } from "@tldraw/tldraw";
import classNames from "classnames";
import SlideListItem, { SlideListItemState } from "./SlideListItem";

interface SlideGridViewProps {
  close: () => void;
  selectSlide: (slideId: string) => void;
  pages: TDPage;
  currentPageId: string;
}

const slideSize = {
  mobile: "100%",
  tablet: "240px",
};

const SlideGridView = ({
  close,
  pages,
  currentPageId,
  selectSlide,
}: SlideGridViewProps) => {
  const viewerCount = 3;
  const selectState = SlideListItemState.DEFAULT;
  return (
    <div className="flex bg-white  px-3 py-3 flex-1 rounded-2xl">
      <div className="flex realtive flex-1 overflow-y-auto">
        <div
          className={`grid flex-1 p-2 grid-cols-1 sm:grid-cols-fill-240 gap-4 content-start`}
        >
          {Object.values(pages).map((page, index) => {
            return (
              <SlideListItem
                page={page}
                index={index + 1}
                viewerCount={viewerCount}
                selectState={
                  page.id === currentPageId
                    ? SlideListItemState.SELECTED
                    : selectState
                }
                size={slideSize}
              />
            );
          })}
        </div>
      </div>
      <button
        className="absolute h-9 left-0 right-0 bottom-11 m-auto w-44 rounded-full bg-traw-purple text-white shadow-3xl text-sm z-[102]"
        onClick={close}
      >
        그리드 뷰 닫기
      </button>
    </div>
  );
};

export default SlideGridView;
