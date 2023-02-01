import React, { ReactNode } from 'react';

import { styled } from 'stitches.config';
import { breakpoints } from 'utils/breakpoints';
import TrawCanvasMenu from './TrawCanvasMenu';

export interface CanvasMenuProps {
  Room?: ReactNode;
}

export const CanvasMenuDesktop = React.memo(function CanvasMenuDesktop({ Room }: CanvasMenuProps) {
  return <StyledCanvasMenuContainer bp={breakpoints}>{Room || <TrawCanvasMenu />}</StyledCanvasMenuContainer>;
});

export const StyledCanvasMenuContainer = styled('div', {
  gap: '3px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  overflow: 'hidden',
  transition: 'all 0.15s  cubic-bezier(0.4, 0, 0.2, 1)',
  fontSize: 13,
  paddingLeft: 10,

  '& > div > *': {
    pointerEvents: 'all',
  },
  variants: {
    bp: {
      mobile: {},
      small: {},
      medium: {},
      large: {},
    },
  },
});
