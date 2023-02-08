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
import { ArrowTopLeftIcon, ArrowTopRightIcon } from '@radix-ui/react-icons';
import useDeviceDetect from 'hooks/useDeviceDetect';
import { HelperContainer, isEmptyDocumentSelector } from 'components/HelperContainer/HelperContainer';

const HeaderPanel = () => {
  const app = useTrawApp();
  const viewMode = app.useStore((state) => state.ui.mode);

  const components = useTRComponentsContext();
  const functions = useTRFunctionsContext();

  const { isBrowser } = useDeviceDetect();

  const isEmptyDocument = app.useStore(isEmptyDocumentSelector);

  return (
    <HeaderPanelContainer>
      <LeftPanelContainer>
        <DocumentMenuPanel
          handleChangeTitle={functions?.handleChangeDocumentTitle}
          handleNavigateHome={functions?.handleNavigateHome}
        />
      </LeftPanelContainer>
      {isEmptyDocument && isBrowser && (
        <HelperContainer className="top-full left-[141px]  text-base items-baseline ml-4 mt-2 ">
          <ArrowTopLeftIcon className="w-auto h-12 fill-current " />
          <div className="flex flex-col md:max-w-[120px] lg:max-w-[190px] xl:max-w-full">
            If you click the logo, you can go home. <br /> You can change the title directly.
          </div>
        </HelperContainer>
      )}

      <ViewToggleGroup />

      <RightPanelContainer>
        {viewMode === TRViewMode.CANVAS && <CanvasMenu Room={components.TopMenu} />}
        {viewMode === TRViewMode.VIDEO && <VideoMenu />}
        {/* 
        {viewMode === TRViewMode.DOC && <div>document</div>} */}
      </RightPanelContainer>
      {isEmptyDocument && isBrowser && (
        <HelperContainer className="top-full right-[285px] text-base items-end mr-4 mt-2 flex-col md:invisible lg:visible">
          <ArrowTopRightIcon className="w-auto h-12 fill-current " />
          <div className="flex flex-col md:max-w-[120px] lg:max-w-[120px] xl:max-w-[180px]  2xl:max-w-full">
            Invite people and have an online meeting.
          </div>
        </HelperContainer>
      )}
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
