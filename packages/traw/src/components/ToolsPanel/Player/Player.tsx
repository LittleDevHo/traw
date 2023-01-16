import { useTrawApp } from 'hooks';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { styled } from 'stitches.config';
import { PlayModeType, TRBlock } from 'types';
import { getFormattedTime } from 'utils/getFormattedTime';
import PlayController from './PlayController';
import Seekbar from './Seekbar';
import SpeedController from './Speed';

const Player = () => {
  const app = useTrawApp();
  const mode = app.useStore((state) => state.player.mode);
  const { targetBlockId, totalTime, isDone, start, speed } = app.useStore((state) => state.player);

  const isPlaying = mode === PlayModeType.PLAYING;

  const [currentTime, setCurrentTime] = useState(0);

  const timerRef = useRef<any>();

  const blocks = app.useStore((state) => state.blocks);

  const sortedBlocks = useMemo(() => Object.values(blocks).sort((a, b) => a.time - b.time), [blocks]);

  const getBlockDuration = useCallback(
    (block: TRBlock): number => {
      const voice = app.getPlayableVoice(block);
      if (voice) {
        return block.voiceEnd - block.voiceStart;
      } else return 500;
    },
    [app],
  );

  useEffect(() => {
    if (mode === PlayModeType.PLAYING && targetBlockId) {
      setCurrentTime((Date.now() - start) * speed);
      timerRef.current = setInterval(() => {
        setCurrentTime((currentTime) => currentTime + 100);
      }, 100);
    } else if (mode === PlayModeType.PAUSE) {
      setCurrentTime((Date.now() - start) * speed);
    } else {
      setCurrentTime(0);
    }
    return () => {
      setCurrentTime(0);
      clearInterval(timerRef.current);
    };
  }, [mode, speed, start, targetBlockId]);

  const currentBaseTime = useMemo(() => {
    let currentBaseTime = 0;
    if (targetBlockId) {
      const targetBlockIndex = sortedBlocks.findIndex((block) => block.id === targetBlockId);
      if (targetBlockIndex > 0) {
        currentBaseTime = sortedBlocks
          .slice(0, targetBlockIndex)
          .map((block) => getBlockDuration(block))
          .reduce((a, b) => a + b, 0);
      } else {
        currentBaseTime = 0;
      }
    }
    return currentBaseTime;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetBlockId, sortedBlocks, getBlockDuration, isPlaying]);

  return (
    <div className="w-full pb-[27px] flex flex-row px-2 sm:px-8 ">
      <PlayController />

      <Spacer />

      <div className="text-traw-grey-dark text-sm">
        {getFormattedTime(isDone ? totalTime : currentBaseTime + currentTime)} / {getFormattedTime(totalTime)}
      </div>

      <Spacer />

      <Seekbar
        blocks={sortedBlocks}
        isPlaying={isPlaying}
        currentBaseTime={currentBaseTime}
        getBlockDuration={getBlockDuration}
      />

      <Spacer />

      <SpeedController />
    </div>
  );
};

export default Player;

const Spacer = styled('div', {
  flex: '0 0 10px',
});
