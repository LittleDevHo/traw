import { Tooltip } from 'components/Primitives/Tooltip';
import { TrawIconButton } from 'components/Primitives/TrawButton/TrawButton';
import { useTrawApp } from 'hooks';
import SvgPause from 'icons/pause';
import SvgPlayArrow from 'icons/play-arrow';
import React from 'react';
import { styled } from 'stitches.config';
import { PlayModeType } from 'types';

const PlayController = () => {
  const app = useTrawApp();

  const mode = app.useStore((state) => state.player.mode);

  const { isDone } = app.useStore((state) => state.player);

  const isPlaying = mode === PlayModeType.PLAYING;

  const handlePlay = () => {
    if (isDone) {
      app.playFromFirstBlock();
    } else if (isPlaying) {
      app.pause();
    } else {
      app.resume();
    }
  };

  return (
    <div className="w-5 h-5">
      {isDone ? (
        <Tooltip label="play">
          <PlayButton variant="primary" onClick={handlePlay}>
            <SvgPlayArrow className="fill-current w-full-h-full absolute" />
          </PlayButton>
        </Tooltip>
      ) : mode === PlayModeType.PLAYING ? (
        <Tooltip label="pause">
          <PlayButton variant="secondary" onClick={handlePlay}>
            <SvgPause className="fill-current w-full-h-full absolute" />
          </PlayButton>
        </Tooltip>
      ) : (
        <Tooltip label="play">
          <PlayButton variant="primary" onClick={handlePlay}>
            <SvgPlayArrow className="fill-current w-full-h-full absolute" />
          </PlayButton>
        </Tooltip>
      )}
    </div>
  );
};

const PlayButton = styled(TrawIconButton, {
  width: '100%',
});

export default PlayController;
