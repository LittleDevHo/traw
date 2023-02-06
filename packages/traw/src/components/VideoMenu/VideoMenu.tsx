import { TrawButton } from 'components/Primitives/TrawButton/TrawButton';
import { useTrawApp } from 'hooks';
import SvgPause from 'icons/pause';
import SvgPlayArrow from 'icons/play-arrow';
import React from 'react';
import { PlayModeType } from 'types';
import LoadingCircular from 'icons/loading-circular';

export const VideoMenu = React.memo(function VideoMenu() {
  const app = useTrawApp();

  const playerMode = app.useStore((state) => state.player.mode);

  const handleClickPlay = () => {
    if (playerMode === PlayModeType.PAUSE) {
      app.resume();
    } else {
      app.playFromFirstBlock();
    }
  };

  const handleClickStop = () => {
    app.pause();
  };

  if (playerMode === PlayModeType.PLAYING) {
    return (
      <TrawButton onClick={handleClickStop} variant="secondary">
        <SvgPause className="w-4 h-4 fill-current mr-[5px]" />
        Pause
      </TrawButton>
    );
  } else if (playerMode === PlayModeType.LOADING) {
    return (
      <TrawButton disabled variant="secondary">
        <LoadingCircular className="animate-spin h-4 w-4 text-white mr-[5px]" />
        Loading
      </TrawButton>
    );
  } else {
    return (
      <TrawButton onClick={handleClickPlay} variant="primary">
        <SvgPlayArrow className="w-4 h-4 fill-current mr-[5px]" />
        Play
      </TrawButton>
    );
  }
});
