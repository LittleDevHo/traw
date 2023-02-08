import { useTrawApp } from 'hooks';
import React from 'react';
import { styled } from 'stitches.config';
import { PlayModeType, TrawSnapshot, TRViewMode } from 'types';

import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { DMContent } from 'components/Primitives/DropdownMenu';
import useDeviceDetect from 'hooks/useDeviceDetect';
import { ArrowUpIcon } from '@radix-ui/react-icons';
import { HelperContainer, isEmptyDocumentSelector } from 'components/HelperContainer/HelperContainer';

const ToggleButtonLabel = {
  [TRViewMode.CANVAS]: 'Canvas',
  [TRViewMode.VIDEO]: 'Video',
  [TRViewMode.DOC]: 'Doc',
};

const ViewToggleGroup = () => {
  const app = useTrawApp();

  const viewMode = app.useStore((state: TrawSnapshot) => state.ui.mode);

  const isPlaying = app.useStore((state: TrawSnapshot) => state.player.mode === PlayModeType.PLAYING);

  const isRecording = app.useStore((state: TrawSnapshot) => state.recording.isRecording);

  const { isBrowser } = useDeviceDetect();

  const isEmptyDocument = app.useStore(isEmptyDocumentSelector);

  const handleClicked = (mode: TRViewMode) => {
    if (!mode) return;

    if (isPlaying) {
      app.backToEditor();
    }

    if (isRecording) {
      return;
    }

    app.toggleViewMode(mode);
  };

  return (
    <ToggleButtonContainer>
      {isBrowser ? (
        <ToggleButtonGroup
          type="single"
          defaultValue={TRViewMode.CANVAS}
          aria-label="Toggle View"
          value={viewMode}
          onValueChange={handleClicked}
        >
          {Object.values(TRViewMode).map((value: TRViewMode, index: number) => (
            <ToggleButtonItem
              value={value}
              aria-label={`${value} mode`}
              key={index}
              disabled={value !== viewMode && (isRecording || isPlaying)}
            >
              {ToggleButtonLabel[value]}
            </ToggleButtonItem>
          ))}
        </ToggleButtonGroup>
      ) : (
        !isRecording && (
          <DropdownMenu.Root>
            <DropdownTriggerButton dir="ltr" id="View-Mode">
              {viewMode}
            </DropdownTriggerButton>
            <DMContent align="center">
              <DropdownMenu.DropdownMenuRadioGroup
                value={viewMode}
                aria-label="Toggle View"
                onValueChange={(value: string) => handleClicked(value as TRViewMode)}
              >
                {Object.values(TRViewMode).map((value: TRViewMode, index: number) => (
                  <StyledDMRadioItem key={index} value={value} aria-label={`${value} mode`}>
                    {ToggleButtonLabel[value]}
                  </StyledDMRadioItem>
                ))}
              </DropdownMenu.DropdownMenuRadioGroup>
            </DMContent>
          </DropdownMenu.Root>
        )
      )}
      {isEmptyDocument && isBrowser && (
        <HelperContainer
          className="top-full  text-base flex-col 
        left-1/2 transform -translate-x-1/2
        items-center
        
        "
        >
          <ArrowUpIcon className="w-auto h-20 fill-current " />
          <div className="flex flex-col md:max-w-[150px] lg:max-w-[200px] xl:max-w-[370px] 2xl:max-w-full">
            Canvas : collaborative whiteboard that can have online meeting
            <br /> Video : You can watch the meeting again.
            <br /> Doc : You can skim the meeting as document.
          </div>
        </HelperContainer>
      )}
    </ToggleButtonContainer>
  );
};

const ToggleButtonContainer = styled('div', {
  display: 'flex',
  margin: '0 auto',
  alignItems: 'center',
  zIndex: 1000,
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

  '&[data-disabled]': {
    color: 'rgba(0, 0, 0, 0.26)',
  },

  '&[data-disabled]:hover': {
    color: 'rgba(0, 0, 0, 0.26) ',
    backgroundColor: '#FFF ',
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

const DropdownTriggerButton = styled(DropdownMenu.Trigger, {
  border: '1px solid #EDEFF6',
  fontSize: '$2',
  backgroundColor: '#FFF',
  padding: '5px 10px',
  transition: 'all 0.15s  cubic-bezier(0.4, 0, 0.2, 1)',
  borderRadius: 15,
  color: '$trawPurple',
  textTransform: 'none',
  minWidth: 75,
});

const StyledDMRadioItem = styled(DropdownMenu.DropdownMenuRadioItem, {
  fontSize: '$2',
  color: '$textPrimary',
  backgroundColor: '#FFF',
  padding: '5px 10px',
  transition: 'all 0.15s  cubic-bezier(0.4, 0, 0.2, 1)',

  '&[data-state=checked]': {
    color: '$trawPurple',
  },
});

export default ViewToggleGroup;
