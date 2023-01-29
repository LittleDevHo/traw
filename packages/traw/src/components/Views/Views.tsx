import { useTrawApp } from 'hooks';
import React from 'react';
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

  return <>{React.createElement(ViewComponentMap[viewMode])}</>;
};

export default Views;
