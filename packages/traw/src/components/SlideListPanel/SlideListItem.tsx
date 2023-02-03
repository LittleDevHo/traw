import { TDPage } from '@tldraw/tldraw';
import classNames from 'classnames';
import React from 'react';
import SlideItemViewerCounter from './SlideItemViewerCounter';
import SlideThumbnail from './SlideThumbnail';

export enum SlideListItemState {
  DEFAULT = 'DEFAULT',
  TARGETED = 'TARGETED',
  SELECTED = 'SELECTED',
}

interface SlideListItemProps {
  page: TDPage;
  index: number;
  type: 'list' | 'preview';
  size: 'micro' | 'xs' | 'sm' | 'md' | 'lg';

  viewerCount?: number;
  selectState?: SlideListItemState;
  setRef?: (ref: HTMLLIElement) => void;
  handleClick?: (slideId: string) => void;
  classnames?: string;
}

const slidesViewport = {
  micro: {
    width: 105,
    height: 59,
  },
  xs: {
    width: 180,
    height: 101,
  },
  sm: {
    width: 375,
    height: 210,
  },
  md: {
    width: 660,
    height: 371,
  },
  lg: {
    width: 916,
    height: 506,
  },
};

const slideSizes = {
  micro: `w-[${slidesViewport.micro.width}px] `,
  xs: `w-[${slidesViewport.xs.width}px] `,
  sm: `w-[${slidesViewport.sm.width}px] `,
  md: `w-[${slidesViewport.md.width}px] `,
  lg: `w-[${slidesViewport.lg.width}px] `,
};

export const SlideListItem = ({
  page,
  index,
  viewerCount = 0,
  selectState = SlideListItemState.DEFAULT,
  type,
  size,
  setRef,
  handleClick,
  classnames,
}: SlideListItemProps) => {
  const handleSelectSlide = () => {
    handleClick && handleClick(page.id);
  };

  return (
    <li
      ref={(el: HTMLLIElement) => {
        setRef && setRef(el);
      }}
      key={page.id}
      onClick={handleSelectSlide}
      className={classNames(`flex aspect-video flex-1 relative  rounded-xl ${slideSizes[size]} ${classnames}}`, {
        'cursor-pointer': handleClick,
      })}
    >
      <div
        className={classNames(
          'absolute top-0 bottom-0 left-0 right-0 w-full h-full z-[101] flex flex-col justify-between outline outline-1 outline-offset-[-1px] rounded-xl',
          {
            'outline-transparent ': selectState === SlideListItemState.DEFAULT,
            'outline-traw-purple ': selectState === SlideListItemState.SELECTED,
            'outline-traw-grey ': selectState === SlideListItemState.TARGETED,
            'outline-traw-sky': type === 'preview',
          },
        )}
      >
        {type === 'list' && viewerCount > 0 && (
          <SlideItemViewerCounter viewerCount={viewerCount} selectState={selectState} />
        )}
        {type === 'list' && <div className="ml-auto text-[10px] text-traw-grey-100 pr-2 pb-1 select-none">{index}</div>}
      </div>
      <SlideThumbnail page={page} viewport={slidesViewport[size]} />
    </li>
  );
};

export default SlideListItem;
