import { styled } from 'stitches.config';
import { TrawSnapshot, TRViewMode } from 'types';

export const HelperContainer = styled('div', {
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  color: '$traw-grey-100',
  userSelect: 'none',
  fontFamily: '$help',
});

export const isEmptyDocumentSelector = (s: TrawSnapshot) => {
  const isRecordsEmpty = Object.keys(s.records).length === 2;

  const isBlocksEmpty = Object.keys(s.blocks).length === 0;

  const isRecording = s.recording.isRecording;

  const isCanvasMode = s.ui.mode === TRViewMode.CANVAS;

  return !isRecording && isCanvasMode && isRecordsEmpty && isBlocksEmpty;
};
