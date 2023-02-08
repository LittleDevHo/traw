import { useTrawApp } from 'hooks';
import React, { Fragment, useMemo } from 'react';
import { PlayModeType, TrawSnapshot } from 'types';
import DocBlockView from './DocBlockView';
import DocImageViewer from './DocImageViewer';

export default function DocumentView() {
  const app = useTrawApp();

  const query = app.useStore((state) => state.editor.search.query);
  const { blockViewportMap, lastBlockMap } = app.useStore((state: TrawSnapshot) => state.doc);

  const targetBlockId = app.useStore((state: TrawSnapshot) =>
    state.player.mode === PlayModeType.PLAYING ? state.player.targetBlockId : undefined,
  );

  const sortedBlocks = app.sortedBlocks;

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
          <Fragment key={block.id}>
            {isFirstSection && <DocImageViewer blockId={lastBlockMap[cameraRecordId]} />}
            <DocBlockView
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
          </Fragment>
        );
      })}
    </>
  );
}
