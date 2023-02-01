import { useTrawApp } from 'hooks';
import React from 'react';
import { styled } from 'stitches.config';
import { TRViewMode } from 'types';

import * as ToggleGroup from '@radix-ui/react-toggle-group';

const ViewToggleGroup = () => {
  const app = useTrawApp();

  const viewMode = app.useStore((state) => state.ui.mode);

  return (
    <ToggleButtonContainer>
      <ToggleButtonGroup
        type="single"
        defaultValue={TRViewMode.CANVAS}
        aria-label="Toggle View"
        value={viewMode}
        onValueChange={(value: TRViewMode) => {
          if (value) app.toggleViewMode(value);
        }}
      >
        <ToggleButtonItem value={TRViewMode.CANVAS} aria-label="Canvas mode">
          Canvas
        </ToggleButtonItem>
        <ToggleButtonItem value={TRViewMode.VIDEO} aria-label="Video mode">
          Video
        </ToggleButtonItem>
        <ToggleButtonItem value={TRViewMode.DOC} aria-label="Document mode">
          Doc
        </ToggleButtonItem>
      </ToggleButtonGroup>
    </ToggleButtonContainer>
  );
};

const ToggleButtonContainer = styled('div', {
  display: 'flex',
  margin: '0 auto',
  alignItems: 'center',
});

const ToggleButtonGroup = styled(ToggleGroup.Root, {});

const ToggleButtonItem = styled(ToggleGroup.Item, {
  border: '1px solid #EDEFF6',
  color: '$textPrimary',
  fontSize: '$2',
  backgroundColor: '#FFF',
  padding: '5px 10px',
  transition: 'all 0.15s  cubic-bezier(0.4, 0, 0.2, 1)',

  '&[data-state=on]': {
    color: '$trawPurple',
  },
  '&[data-state=off]:hover': {
    color: '$trawPurple',
    backgroundColor: '$hover',
  },
  '&:first-child': {
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
  },
  '&:last-child': {
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
  },
});

export default ViewToggleGroup;
