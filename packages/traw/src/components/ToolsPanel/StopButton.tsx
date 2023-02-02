import { TDSnapshot } from '@tldraw/tldraw';
import { Tooltip } from 'components/Primitives/Tooltip';
import { useTrawApp } from 'hooks';
import { useTldrawApp } from 'hooks/useTldrawApp';
import SvgStop from 'icons/StopIcon';
import React, { memo, useEffect, useState } from 'react';
import { styled } from 'stitches.config';
import { breakpoints } from 'utils/breakpoints';

const StopButton = memo(() => {
  const app = useTrawApp();

  const tldrawApp = useTldrawApp();

  const [isSolo, setIsSolo] = useState(false);

  const room = tldrawApp.useStore((state: TDSnapshot) => state.room);

  useEffect(() => {
    if (!room) return;

    const others = Object.values(room.users).filter((user) => user.id !== room.userId);
    others.length === 0 ? setIsSolo(true) : setIsSolo(false);
  }, [room]);

  const handleStop = () => {
    app.stopRecording();
  };

  return (
    <Container bp={breakpoints}>
      <Tooltip label={isSolo ? 'Stop recording' : 'Leave conversation'} side="top">
        <StyledStopButton onClick={handleStop}>
          <SvgStop />
        </StyledStopButton>
      </Tooltip>
    </Container>
  );
});

StopButton.displayName = 'StopButton';

export default StopButton;

const Container = styled('div', {
  position: 'absolute',
  zIndex: 200,
  left: 11,
  bottom: 63,
  width: 50,
  height: 50,
  variants: {
    bp: {
      medium: {
        left: 10,
        bottom: 20,
      },
    },
  },
});

const StyledStopButton = styled('button', {
  width: '100%',
  height: '100%',
  borderRadius: 15,
  display: 'flex',
  padding: 0,
  justifyContent: 'center',
  alignItems: 'center',
  outline: 'none',
  background: '#FFFFFF',
  boxShadow: '0px 10px 30px rgba(189, 188, 249, 0.3)',
  '& svg': {
    position: 'relative',
    width: 30,
  },
});
