import { useTrawApp } from 'hooks';
import SvgLogoSmall from 'icons/Logo';
import React, { useCallback, memo } from 'react';
import { styled } from 'stitches.config';
import { breakpoints } from 'utils/breakpoints';
import Title from './Title';

interface DocumentMenuProps {
  handleChangeTitle?: (newValue: string) => void;
  handleNavigateHome?: () => void;
}

export const DocumentMenuPanel = memo(function DocumentMenu({
  handleChangeTitle,
  handleNavigateHome,
}: DocumentMenuProps) {
  const app = useTrawApp();
  const state = app.useStore();
  const { document } = state;

  const handleTitle = useCallback(
    (newValue: string) => {
      handleChangeTitle?.(newValue);
    },
    [handleChangeTitle],
  );

  const handleClickLogo = () => {
    handleNavigateHome ? handleNavigateHome() : window.open('https://app.traw.io', '_blank');
  };

  return (
    <>
      <StyledDocumentMenuContainer bp={breakpoints}>
        <button onClick={handleClickLogo}>
          <SvgLogoSmall className="w-6 h-6" />
        </button>
        <div className="flex items-center">
          <Title title={document.name} canEdit={document.canEdit} handleChangeTitle={handleTitle} />
        </div>
      </StyledDocumentMenuContainer>
    </>
  );
});

const StyledDocumentMenuContainer = styled('div', {
  position: 'absolute',
  left: 16,
  marginRight: 16,
  minHeight: 0,
  width: 'auto',
  height: 59,
  gap: '$4',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 200,
  overflow: 'hidden',
  pointerEvents: 'none',
  transition: 'all 0.15s  cubic-bezier(0.4, 0, 0.2, 1)',
  fontSize: 13,
  paddingRight: 10,

  '& > div > *': {
    pointerEvents: 'all',
  },
  '& > button': {
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
