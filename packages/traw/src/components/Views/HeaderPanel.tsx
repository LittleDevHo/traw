import { DocumentMenuPanel } from 'components/DocumentMenuPanel';
import { CanvasMenu } from 'components/CanvasMenu';
import { useTrawApp } from 'hooks';
import { useTRComponentsContext } from 'hooks/useCustomComponent';
import { useTRFunctionsContext } from 'hooks/useCustomFunctions';
import React from 'react';
import { styled } from 'stitches.config';
import { TRViewMode } from 'types';
import ViewToggleGroup from './ViewToggleGroup';
import { VideoMenu } from 'components/VideoMenu';

const HeaderPanel = () => {
  const app = useTrawApp();
  const viewMode = app.useStore((state) => state.ui.mode);

  const components = useTRComponentsContext();
  const functions = useTRFunctionsContext();

  return (
    <HeaderPanelContainer>
      <LeftPanelContainer>
        <DocumentMenuPanel
          handleChangeTitle={functions?.handleChangeDocumentTitle}
          handleNavigateHome={functions?.handleNavigateHome}
        />
      </LeftPanelContainer>

      <ViewToggleGroup />

      <RightPanelContainer>
        {viewMode === TRViewMode.CANVAS && <CanvasMenu Room={components.TopMenu} />}
        {viewMode === TRViewMode.VIDEO && <VideoMenu />}
        {/* 
        {viewMode === TRViewMode.DOC && <div>document</div>} */}
      </RightPanelContainer>
    </HeaderPanelContainer>
  );
};

const HeaderPanelContainer = styled('div', {
  position: 'absolute',
  top: 0,
  width: '100%',
  backgroundColor: '#fff',
  height: 59,
  boxShadow: '0px 10px 20px rgba(189, 188, 249, 0.3)',
  zIndex: 9,
  display: 'flex',
});

const LeftPanelContainer = styled('div', {});

const RightPanelContainer = styled('div', {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'absolute',
  userSelect: 'none',
  top: 0,
  right: 0,
  marginLeft: 16,
  minHeight: 0,
  width: 'auto',
  height: 59,
  zIndex: 200,
  paddingRight: 10,
});

export default HeaderPanel;
