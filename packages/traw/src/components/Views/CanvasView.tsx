import { Editor } from 'components/Editor';
import { SlideListPanel } from 'components/SlideListPanel';
import { ToolsPanel } from 'components/ToolsPanel';
import { TopPanel } from 'components/TopPanel';
import { useTrawApp } from 'hooks';
import React, { useCallback } from 'react';
import { HelpPanel } from 'components/ToolsPanel/HelpPanel';
import { useTRComponentsContext } from 'hooks/useCustomComponent';
import { useTRFunctionsContext } from 'hooks/useCustomFunctions';
import { styled } from 'stitches.config';
import { breakpoints } from 'utils/breakpoints';
import { BlockPanel } from 'components/BlockPanel';
import usePlay from 'hooks/usePlay';

const CanvasView = () => {
  const trawApp = useTrawApp();
  const components = useTRComponentsContext();
  const functions = useTRFunctionsContext();
  const document = trawApp.useStore((state) => state.document);
  const { handlePlayClick } = usePlay();

  const isPlayerMode = trawApp.useStore((state) => state.playerOptions?.isPlayerMode);
  const readOnly = isPlayerMode || (document && !document.canEdit) ? true : false;

  const { speechRecognitionLanguage } = trawApp.useStore((state) => state.recording);
  const handleLanguageClickDefault = useCallback(() => {
    if (speechRecognitionLanguage === 'en-US') {
      trawApp.setSpeechRecognitionLanguage('ko-KR');
    } else {
      trawApp.setSpeechRecognitionLanguage('en-US');
    }
  }, [speechRecognitionLanguage, trawApp]);

  return (
    <div id="traw" data-testid="traw" className="flex flex-1 flex-col overflow-hidden ">
      <HelpPanel />
      <Editor components={components} readOnly={readOnly} functions={functions} />
      <StyledUI bp={breakpoints}>
        {!isPlayerMode && (
          <TopPanel
            Room={components?.TopMenu}
            handleChangeTitle={functions?.handleChangeDocumentTitle}
            handleNavigateHome={functions?.handleNavigateHome}
          />
        )}
        {!isPlayerMode && (
          <BlockPanel
            handlePlayClick={handlePlayClick}
            handleLanguageClick={functions?.handleLanguageClick ?? handleLanguageClickDefault}
            components={{
              EmptyVoiceNote: components?.EmptyVoiceNote,
              EmptyDocumentPopup: components?.EmptyDocumentPopup,
            }}
          />
        )}

        {!isPlayerMode && <SlideListPanel />}
        <ToolsPanel />
      </StyledUI>
    </div>
  );
};

const StyledUI = styled('div', {
  position: 'absolute',
  overflow: 'hidden',
  top: 0,
  left: 0,
  height: '100%',
  width: '100%',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  pointerEvents: 'none',
  '& > *': {
    pointerEvents: 'all',
  },

  padding: 0,
  variants: {
    bp: {
      medium: {
        padding: 8,
      },
    },
  },
});

export default CanvasView;
