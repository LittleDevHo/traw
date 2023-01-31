import { TrawButton } from 'components/Primitives/TrawButton/TrawButton';
import { useTrawApp } from 'hooks';
import SvgHeadset from 'icons/Headset';
import SvgMic from 'icons/mic';
import SvgMicOff from 'icons/mic-off';
import React from 'react';
import { styled } from 'stitches.config';
import { PlayModeType } from 'types';

const TrawCanvasMenu = () => {
  const app = useTrawApp();

  const isEditMode = app.useStore((state) => state.player.mode === PlayModeType.EDIT);
  const { isRecording, isMuted } = app.useStore((state) => state.recording);

  const handleStart = () => {
    app.startRecording();
  };

  const handleStop = () => {
    app.stopRecording();
  };

  const handleUnmute = () => {
    app.unmute();
  };

  const handleMute = () => {
    app.mute();
  };

  return (
    <StyledPanel>
      {isEditMode ? (
        <>
          {isRecording ? (
            <>
              <TrawButton onClick={handleStop} variant="primary">
                Stop Recording
              </TrawButton>
              {isMuted ? (
                <TrawButton onClick={handleUnmute} variant="icon">
                  <SvgMicOff className="w-6 h-6 p-1 color-white fill-current" />
                </TrawButton>
              ) : (
                <TrawButton onClick={handleMute} variant="icon">
                  <SvgMic className="w-6 h-6 p-1 color-white fill-current" />
                </TrawButton>
              )}
            </>
          ) : (
            <>
              <TrawButton onClick={handleStart} variant="primary">
                <SvgHeadset className="w-4 h-4  fill-current mr-[6px]" />
                Start Recording
              </TrawButton>
            </>
          )}
        </>
      ) : (
        <TrawButton onClick={app.backToEditor} variant="primary">
          Back to Edit
        </TrawButton>
      )}
    </StyledPanel>
  );
};

const StyledPanel = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: 3,
});

export default TrawCanvasMenu;
