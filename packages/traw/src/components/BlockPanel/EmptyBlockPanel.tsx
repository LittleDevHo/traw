import React from 'react';
import EmptyContents from './EmptyContents';

interface EmptyBlockPanelProps {
  EmptyVoiceNote?: React.ReactNode;
  hideEmptyContents?: boolean;
}

const EmptyBlockPanel = ({ EmptyVoiceNote, hideEmptyContents }: EmptyBlockPanelProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 select-none">
      {!hideEmptyContents && <EmptyContents />}

      {EmptyVoiceNote}
    </div>
  );
};

export default EmptyBlockPanel;
