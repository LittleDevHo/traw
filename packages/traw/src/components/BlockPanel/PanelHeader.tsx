import { Cross2Icon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { SpeakingIndicator } from 'components/Indicator';
import { TrawIconButton } from 'components/Primitives/TrawButton/TrawButton';
import { useTrawApp } from 'hooks';
import useDeviceDetect from 'hooks/useDeviceDetect';
import { DoubleArrowLeftIcon } from 'icons/DoubleArrowLeft';
import SvgRecording from 'icons/recording';
import React from 'react';
import RecordingTimer from './RecordingTimer';
import SearchInput from './SearchInput';

export interface PanelHeaderProps {
  isRecording?: boolean;
  isTalking: boolean;
  panelOpen: boolean;
  totalTime: number;
  togglePanel?: () => void;
}

const formatTime = (time: number) => {
  const date = new Date(0);
  date.setSeconds((time || 0) / 1000); // specify value for SECONDS here
  const timeString = date.toISOString().substring(11, 19);
  return timeString;
};

export const PanelHeader = ({ isRecording, isTalking, panelOpen, togglePanel, totalTime }: PanelHeaderProps) => {
  const { isBrowser } = useDeviceDetect();
  const app = useTrawApp();
  const isSearching = app.useStore((state) => state.editor.search.isSearching);

  const handleStartSearch = () => {
    app.startSearch();
  };

  return (
    <header className="flex mt-2 w-full gap-2  items-center select-none">
      {isSearching && <SearchInput />}
      {!isRecording && !isSearching && (
        <>
          {isBrowser ? (
            <>
              <div className="text-traw-grey-dark text-[13px] font-bold pl-2">Voice note</div>
              <div className="text-traw-grey-100 font-[12px]">{formatTime(totalTime)}</div>
              <TrawIconButton className="ml-auto" onClick={handleStartSearch}>
                <MagnifyingGlassIcon className="text-traw-grey-100" />
              </TrawIconButton>
              <TrawIconButton onClick={togglePanel}>
                {panelOpen ? (
                  <DoubleArrowLeftIcon flipHorizontal className="text-traw-grey-100 transition-transform" />
                ) : (
                  <DoubleArrowLeftIcon className="text-traw-grey-100 transition-transform" />
                )}
              </TrawIconButton>
            </>
          ) : (
            <>
              <div className="text-traw-grey-dark text-[13px] font-bold " onClick={togglePanel}>
                Voice note
              </div>
              {panelOpen && (
                <button onClick={togglePanel} className="ml-auto mr-1">
                  <Cross2Icon className="text-traw-grey-100 transition-transform w-4 h-4" />
                </button>
              )}
            </>
          )}
        </>
      )}
      {isRecording && !isSearching && (
        <>
          {panelOpen ? (
            <>
              <div className="text-traw-grey-dark text-[13px] font-bold pl-2 flex items-center">
                <div>Voice note</div>
                {!isBrowser && <RecordingTimer className="flex-1 ml-1.5" />}
              </div>
              <button onClick={togglePanel} className=" ml-auto">
                {isBrowser ? (
                  <DoubleArrowLeftIcon flipHorizontal className="text-traw-grey-100 current" />
                ) : (
                  <Cross2Icon className="text-traw-grey-100 current w-4 h-4 mr-1" />
                )}
              </button>
            </>
          ) : (
            <>
              {isBrowser ? (
                <div className="flex flex-1  items-end cursor-pointer pl-2" onClick={togglePanel}>
                  <RecordingTimer className="flex-1" />
                  <SpeakingIndicator size={17} isSpeaking={isTalking} />
                </div>
              ) : (
                <div className="text-traw-grey-dark text-[13px] font-bold  flex items-center" onClick={togglePanel}>
                  <SvgRecording className="text-traw-red mr-1.5" width="10" height="10" />
                  <div>Voice note</div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </header>
  );
};

export default PanelHeader;
