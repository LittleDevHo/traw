import { Tooltip } from 'components/Primitives/Tooltip';
import { TrawButton } from 'components/Primitives/TrawButton/TrawButton';
import { useTrawApp } from 'hooks';
import SvgPause from 'icons/pause';
import SvgPlayArrow from 'icons/play-arrow';
import React from 'react';
import { PlayModeType } from 'types';

export const VideoMenu = React.memo(function VideoMenu() {
  const app = useTrawApp();

  const playerMode = app.useStore((state) => state.player.mode);

  const handleClickPlay = () => {
    app.playFromFirstBlock();
  };

  const handleClickStop = () => {
    app.backToEditor();
  };

  return (
    <div>
      {playerMode !== PlayModeType.PLAYING && (
        <Tooltip label="play">
          <TrawButton onClick={handleClickPlay} variant="primary">
            <SvgPlayArrow className="w-4 h-4  fill-current mr-[6px]" />
            Play
          </TrawButton>
        </Tooltip>
      )}
      {playerMode === PlayModeType.PLAYING && (
        <Tooltip label="stop">
          <TrawButton onClick={handleClickStop} variant="secondary">
            <SvgPause className="w-4 h-4  fill-current mr-[6px]" />
            STOP
          </TrawButton>
        </Tooltip>
      )}
    </div>
  );
});
