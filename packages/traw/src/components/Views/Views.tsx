import { useTrawApp } from 'hooks';
import React from 'react';
import { styled } from 'stitches.config';
import { TRViewMode } from 'types';
import CanvasView from './CanvasView';
import DocView from './DocView';
import VideoView from './VideoView';

const ViewComponentMap = {
  [TRViewMode.DOC]: DocView,
  [TRViewMode.VIDEO]: VideoView,
  [TRViewMode.CANVAS]: CanvasView,
};

const Views = () => {
  const app = useTrawApp();

  const viewMode = app.useStore((state) => state.ui.mode);

  return <ViewContainer>{React.createElement(ViewComponentMap[viewMode])}</ViewContainer>;
};

const ViewContainer = styled('div', {
  display: 'flex',
  paddingTop: 59,
  height: '100%',
  flex: 1,
});

export default Views;
