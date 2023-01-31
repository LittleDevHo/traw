import React, { ReactNode } from 'react';

import { styled } from 'stitches.config';
import TrawCanvasMenu from './TrawCanvasMenu';

export interface CanvasMenuProps {
  Room?: ReactNode;
}

export const CanvasMenuMobile = React.memo(function CanvasMenuMobile({ Room }: CanvasMenuProps) {
  return (
    <>
      <StyledCanvasMenuContainer>
        <StyledRightPanelContainer>{Room || <TrawCanvasMenu />}</StyledRightPanelContainer>
      </StyledCanvasMenuContainer>
    </>
  );
});

const StyledRightPanelContainer = styled('div', {
  marginLeft: 'auto',
  display: 'flex',
  alignItems: 'center',
});

const StyledCanvasMenuContainer = styled('div', {
  gap: '3px',
  display: 'flex',
  alignItems: 'center',
  overflow: 'scroll',
  fontSize: 13,

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
