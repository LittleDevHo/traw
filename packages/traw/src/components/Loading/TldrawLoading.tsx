import type { TDSnapshot } from '@tldraw/tldraw';
import { useTrawApp } from 'hooks';
import { useTldrawApp } from 'hooks/useTldrawApp';
import * as React from 'react';
import { styled } from 'stitches.config';
import { TrawSnapshot } from 'types';
import { breakpoints } from 'utils/breakpoints';

// import Lottie from 'lottie-react';
// import LoadingAnimation from 'static/json/loading.json';

const loadingSelector = (s: TDSnapshot) => s.appState.isLoading;

export function TldrawLoading() {
  const trawApp = useTrawApp();

  const { isRecording } = trawApp.useStore((state: TrawSnapshot) => state.recording);
  const app = useTldrawApp();
  const isLoading = app.useStore(loadingSelector);

  return (
    <StyledLoadingPanelContainer hidden={!isLoading} isRecording={isRecording} bp={breakpoints}>
      Loading...
    </StyledLoadingPanelContainer>
  );
}

const StyledLoadingPanelContainer = styled('div', {
  position: 'absolute',
  borderRadius: 20,
  padding: '8px 14px',
  fontFamily: 'var(--fonts-ui)',
  fontSize: 'var(--fontSizes-1)',
  backgroundColor: 'white',
  zIndex: 200,

  bottom: 63,
  pointerEvents: 'none',
  '& > div > *': {
    pointerEvents: 'all',
  },
  variants: {
    bp: {
      medium: {
        bottom: 20,
      },
    },
    hidden: {
      true: {
        display: 'none',
      },
      false: {
        display: 'block',
      },
    },

    isRecording: {
      true: {
        left: 72,
      },
      false: {
        left: 11,
      },
    },
  },
});

export default TldrawLoading;
