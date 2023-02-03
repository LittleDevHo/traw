import BlockItem from 'components/BlockPanel/BlockItem/BlockItem';
import { useTrawApp } from 'hooks';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { PlayModeType, TrawSnapshot, TRViewMode } from 'types';
import { useEventListener, useIsomorphicLayoutEffect } from 'usehooks-ts';
import EmptyBlockPanel from './EmptyBlockPanel';
import ScrollToBottomButton from './ScrollToBottomButton';

export interface BlockListProps {
  isRecording: boolean;
  EmptyVoiceNote?: React.ReactNode;
}

export default function BlockList({ isRecording, EmptyVoiceNote }: BlockListProps) {
  const app = useTrawApp();

  const query = app.useStore((state) => state.editor.search.query);
  const blocks = app.useStore((state: TrawSnapshot) => state.blocks);
  const mode = app.useStore((state: TrawSnapshot) => state.player.mode);

  const viewMode = app.useStore((state: TrawSnapshot) => state.ui.mode);

  const targetBlockId = app.useStore((state: TrawSnapshot) =>
    state.player.mode === PlayModeType.PLAYING ? state.player.targetBlockId : undefined,
  );

  const initialBlockLength = Object.values(blocks).filter((block) => block.isActive).length - 1 ?? 0;

  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const domRef = useRef<HTMLDivElement>(null);

  const [needToScroll, setNeedToScroll] = useState(false);

  const [isScrolled, setIsScrolled] = useState(false);

  const [height, setHeight] = useState(0);

  const sortedBlocks = app.sortedBlocks;

  const sortedFilteredBlocks = useMemo(() => {
    if (query) {
      return sortedBlocks.filter((block) => block.text.includes(query));
    }
    return sortedBlocks;
  }, [query, sortedBlocks]);

  const [beforeBlockLength, setBeforeBlockLength] = useState(sortedFilteredBlocks.length);

  const handleResize = useCallback(() => {
    const height = domRef.current?.offsetHeight ?? 0;

    setHeight(height);
  }, []);

  useEventListener('resize', handleResize);

  useIsomorphicLayoutEffect(() => {
    handleResize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domRef.current]);

  const scrollTo = useCallback((index: number) => {
    setTimeout(() => {
      if (virtuosoRef.current) {
        virtuosoRef.current.scrollToIndex({ index, align: 'start', behavior: 'smooth' });
        setNeedToScroll(false);
        setIsScrolled(false);
      }
    }, 100);
  }, []);

  useEffect(() => {
    if (isRecording) {
      scrollTo(sortedFilteredBlocks.length - 1);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording]);

  useEffect(() => {
    if (isScrolled) {
      setNeedToScroll(true);
    } else {
      scrollTo(sortedFilteredBlocks.length - 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedFilteredBlocks.length]);

  const handleAtBottomStateChange = (atBottom: boolean) => {
    if (atBottom) {
      setIsScrolled(false);
      setNeedToScroll(false);
    } else {
      setIsScrolled(true);
    }
  };
  /**
   * When voice recognition becomes longer, the height of panel decreases.
   * At this time, scroll to the bottom so that the scrollToBottom button is not visible
   */
  useEffect(() => {
    if (needToScroll) return;

    const newBlockLength = sortedFilteredBlocks.length;
    const newHeight = domRef.current?.offsetHeight;
    if (!newHeight) return;
    if (height < newHeight && newBlockLength > beforeBlockLength) {
      scrollTo(newBlockLength - 1);
      setHeight(newHeight);
    }
    setBeforeBlockLength(newBlockLength);
  }, [beforeBlockLength, needToScroll, scrollTo, sortedFilteredBlocks.length, height]);

  /**
   * Scroll to target block when playing
   */
  useEffect(() => {
    if (mode === PlayModeType.PLAYING && targetBlockId) {
      const index = sortedFilteredBlocks.findIndex((block) => block.id === targetBlockId);
      if (index !== -1) {
        scrollTo(index);
      }
    }
  }, [sortedFilteredBlocks, mode, scrollTo, targetBlockId]);

  if (query && sortedFilteredBlocks.length === 0) {
    return <EmptyBlockPanel EmptyVoiceNote={<div>No results found</div>} hideEmptyContents />;
  }

  if (sortedFilteredBlocks.length === 0 && !isRecording) {
    return <EmptyBlockPanel EmptyVoiceNote={EmptyVoiceNote} hideEmptyContents={viewMode !== TRViewMode.CANVAS} />;
  }

  return (
    <div
      className="mt-2 md:mt-4 flex-2 flex-auto w-full overflow-y-auto min-h-0 pl-0 md:pl-2 relative overscroll-y-none"
      ref={domRef}
    >
      <Virtuoso
        data={sortedFilteredBlocks}
        style={{ height: `${height}px`, minHeight: '100%' }}
        totalCount={sortedFilteredBlocks.length}
        atBottomStateChange={handleAtBottomStateChange}
        overscan={5}
        ref={virtuosoRef}
        initialTopMostItemIndex={initialBlockLength}
        itemContent={(index, block) => {
          return (
            <BlockItem
              key={block.id}
              userId={block.userId}
              date={block.time}
              blockId={block.id}
              blockText={block.text}
              isPlaying={targetBlockId === block.id}
              isVoiceBlock={block.voices.length > 0}
              highlightText={query || undefined}
              beforeBlockUserId={sortedFilteredBlocks[index - 1]?.userId}
            />
          );
        }}
      />
      {!!sortedFilteredBlocks.length && needToScroll && isScrolled && (
        <ScrollToBottomButton handleClick={() => scrollTo(sortedFilteredBlocks.length - 1)} />
      )}
    </div>
  );
}
