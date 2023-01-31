import React from 'react';
import classNames from 'classnames';
import { useTrawApp } from 'hooks';
import { styled } from 'stitches.config';
import { TRViewMode } from 'types';

const SELECTED_CSS = 'text-traw-purple';

const ViewToggleGroup = () => {
  const app = useTrawApp();

  const viewMode = app.useStore((state) => state.ui.mode);

  const handleClicked = (mode: TRViewMode) => {
    app.toggleViewMode(mode);
  };

  return (
    <ToggleButtonContainer>
      <button
        type="button"
        className={classNames(
          'px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-l-lg hover:bg-gray-100 hover:text-traw-purple ',
          viewMode === TRViewMode.CANVAS && SELECTED_CSS,
        )}
        onClick={() => handleClicked(TRViewMode.CANVAS)}
      >
        Canvas
      </button>
      <button
        type="button"
        className={classNames(
          'px-4 py-2 text-sm font-medium text-gray-900 bg-white border-t border-b border-gray-200 hover:bg-gray-100 hover:text-traw-purple',
          viewMode === TRViewMode.VIDEO && SELECTED_CSS,
        )}
        onClick={() => handleClicked(TRViewMode.VIDEO)}
      >
        Video
      </button>
      <button
        type="button"
        className={classNames(
          'px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-r-md hover:bg-gray-100 hover:text-traw-purple',
          viewMode === TRViewMode.DOC && SELECTED_CSS,
        )}
        onClick={() => handleClicked(TRViewMode.DOC)}
      >
        Doc
      </button>
    </ToggleButtonContainer>
  );
};

const ToggleButtonContainer = styled('div', {
  borderRadius: 15,
  display: 'flex',
  margin: '0 auto',
  alignItems: 'center',
});

export default ViewToggleGroup;
