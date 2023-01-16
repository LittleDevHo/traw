import { TrawButton } from 'components/Primitives/TrawButton/TrawButton';
import { useTrawApp } from 'hooks';
import React from 'react';

const style = {
  fontWeight: 500,
};

const AvailableSpeeds = [0.7, 1, 1.5, 2] as const;

const SpeedController = () => {
  const app = useTrawApp();

  const { speed } = app.useStore((state) => state.player);

  const toggleSpeed = () => {
    const currentIndex = AvailableSpeeds.findIndex((s) => s === speed);
    const nextIndex = (currentIndex + 1) % AvailableSpeeds.length;
    app.setSpeed(AvailableSpeeds[nextIndex]);
  };

  return (
    <div className="w-5 h-5 mt-[-6px]">
      <TrawButton variant="text" style={style} onClick={toggleSpeed}>
        {speed}x
      </TrawButton>
    </div>
  );
};

export default SpeedController;
