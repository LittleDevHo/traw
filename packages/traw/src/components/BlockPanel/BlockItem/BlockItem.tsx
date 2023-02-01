import { useTrawApp } from 'hooks';
import React, { memo } from 'react';
import { TrawSnapshot, TRViewMode } from 'types';
import DocBlockItem from './DocBlockItem';
import CanvasBlockItem from './CanvasBlockItem';
import VideoBlockItem from './VideoBlockItem';

export interface BlockItemProps {
  userId: string;
  blockId: string;
  date: string | number;
  blockText: string;
  isVoiceBlock: boolean;
  hideUserName?: boolean;
  isPlaying?: boolean;
  beforeBlockUserId: string;
  highlightText?: string;
}

export const BlockItem = memo((props: BlockItemProps) => {
  const trawApp = useTrawApp();

  const viewMode = trawApp.useStore((state: TrawSnapshot) => state.ui.mode);

  if (viewMode === TRViewMode.CANVAS) {
    return <CanvasBlockItem {...props} />;
  } else if (viewMode === TRViewMode.VIDEO) {
    return <VideoBlockItem {...props} />;
  } else if (viewMode === TRViewMode.DOC) {
    return <DocBlockItem {...props} />;
  }

  return null;
});

BlockItem.displayName = 'BlockItem';

export default BlockItem;
