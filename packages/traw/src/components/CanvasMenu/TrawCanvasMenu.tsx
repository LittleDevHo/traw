import { TrawButton } from 'components/Primitives/TrawButton/TrawButton';
import { useTrawApp } from 'hooks';
import SvgHeadset from 'icons/Headset';
import SvgMic from 'icons/mic';
import SvgMicOff from 'icons/mic-off';
import React, { useMemo } from 'react';
import { styled } from 'stitches.config';
import { PlayModeType } from 'types';

const TrawCanvasMenu = () => {
  const { mute, unmute, backToEditor, startRecording, stopRecording, useStore } = useTrawApp();

  const isEditMode = useStore((state) => state.player.mode === PlayModeType.EDIT);
  const { isRecording, isMuted } = useStore((state) => state.recording);

  const micButton = useMemo(() => {
    if (isMuted) {
      return (
        <TrawButton onClick={unmute} variant="icon">
          <SvgMicOff className="w-6 h-6 p-1 color-white fill-current" />
        </TrawButton>
      );
    } else {
      return (
        <TrawButton onClick={mute} variant="icon">
          <SvgMic className="w-6 h-6 p-1 color-white fill-current" />
        </TrawButton>
      );
    }
  }, [mute, unmute, isMuted]);

  const menus = useMemo(() => {
    if (isEditMode) {
      if (isRecording) {
        return (
          <>
            <TrawButton onClick={stopRecording} variant="primary">
              Stop Recording
            </TrawButton>
            {micButton}
          </>
        );
      } else {
        return (
          <TrawButton onClick={startRecording} variant="primary">
            <SvgHeadset className="w-4 h-4  fill-current mr-[6px]" />
            Start Recording
          </TrawButton>
        );
      }
    } else {
      return (
        <TrawButton onClick={backToEditor} variant="primary">
          Back to Edit
        </TrawButton>
      );
    }
  }, [backToEditor, startRecording, stopRecording, isEditMode, isRecording, micButton]);

  return <StyledPanel>{menus}</StyledPanel>;
};

const StyledPanel = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: 3,
});

export default TrawCanvasMenu;
