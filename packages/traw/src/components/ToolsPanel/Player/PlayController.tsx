import { Tooltip } from 'components/Primitives/Tooltip';
import { TrawIconButton } from 'components/Primitives/TrawButton/TrawButton';
import { useTrawApp } from 'hooks';
import SvgPause from 'icons/pause';
import SvgPlayArrow from 'icons/play-arrow';
import React from 'react';
import { styled } from 'stitches.config';
import { PlayModeType } from 'types';
import LoadingCircular from 'icons/loading-circular';

const PlayController = () => {
  const app = useTrawApp();

  const mode = app.useStore((state) => state.player.mode);
  const { isDone } = app.useStore((state) => state.player);

  const handlePlay = () => {
    if (isDone) {
      app.playFromFirstBlock();
    } else if (mode === PlayModeType.PLAYING) {
      app.pause();
    } else {
      app.resume();
    }
  };

  if (isDone) {
    return (
      <div className="w-5 h-5">
        <Tooltip label="play">
          <PlayButton variant="primary" onClick={handlePlay}>
            <SvgPlayArrow className="fill-current w-full-h-full absolute" />
          </PlayButton>
        </Tooltip>
      </div>
    );
  } else if (mode === PlayModeType.PLAYING) {
    return (
      <div className="w-5 h-5">
        <Tooltip label="pause">
          <PlayButton variant="secondary" onClick={handlePlay}>
            <SvgPause className="fill-current w-full-h-full absolute" />
          </PlayButton>
        </Tooltip>
      </div>
    );
  } else if (mode === PlayModeType.LOADING) {
    return (
      <div className="w-5 h-5">
        <Tooltip label="loading">
          <LoadingCircular className="animate-spin h-5 w-5 text-traw-pink" />
        </Tooltip>
      </div>
    );
  } else {
    return (
      <div className="w-5 h-5">
        <Tooltip label="play">
          <PlayButton variant="primary" onClick={handlePlay}>
            <SvgPlayArrow className="fill-current w-full-h-full absolute" />
          </PlayButton>
        </Tooltip>
      </div>
    );
  }
};

const PlayButton = styled(TrawIconButton, {
  width: '100%',
});

export default PlayController;
