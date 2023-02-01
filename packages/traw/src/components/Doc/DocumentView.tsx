import { useTrawApp } from 'hooks';
import React, { useMemo } from 'react';
import { PlayModeType, TrawSnapshot } from 'types';
import DockBlockView from './DocBlockView';

export default function DocumentView() {
  const app = useTrawApp();

  const query = app.useStore((state) => state.editor.search.query);
  const blocks = app.useStore((state: TrawSnapshot) => state.blocks);
  const blockViewportMap = app.useStore((state: TrawSnapshot) => state.blockViewportMap);

  const targetBlockId = app.useStore((state: TrawSnapshot) =>
    state.player.mode === PlayModeType.PLAYING ? state.player.targetBlockId : undefined,
  );

  const sortedBlocks = useMemo(() => {
    return Object.values(blocks)
      .filter((block) => block.isActive)
      .sort((a, b) => a.time - b.time);
  }, [blocks]);

  const sortedFilteredBlocks = useMemo(() => {
    if (query) {
      return sortedBlocks.filter((block) => block.text.includes(query));
    }
    return sortedBlocks;
  }, [query, sortedBlocks]);

  return (
    <>
      {sortedFilteredBlocks.map((block, index) => {
        const cameraRecordId = blockViewportMap[block.id];
        const isFirstSection = index === 0 || cameraRecordId !== blockViewportMap[sortedFilteredBlocks[index - 1].id];
        return (
          <DockBlockView
            key={block.id}
            userId={block.userId}
            date={block.time}
            blockId={block.id}
            blockText={block.text}
            isPlaying={targetBlockId === block.id}
            isVoiceBlock={block.voices.length > 0}
            highlightText={query || undefined}
            beforeBlockUserId={sortedFilteredBlocks[index - 1]?.userId}
            isFirstSection={isFirstSection}
          />
        );
      })}
    </>
  );
}
