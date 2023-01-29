import { CursorComponent } from '@tldraw/core';
import { ErrorPopupProps } from 'components';
import * as React from 'react';

export interface TRCustomComponentsType {
  TopMenu?: React.ReactNode;
  EmptyVoiceNote?: React.ReactNode;
  EmptyDocumentPopup?: React.ReactNode;
  ErrorPopup?: React.ComponentType<ErrorPopupProps>;
  /**
   * The component to render for multiplayer cursors.
   */
  Cursor?: CursorComponent;
}

export const TRComponentsContext = React.createContext({} as TRCustomComponentsType);

export function useTRComponentsContext() {
  const context = React.useContext(TRComponentsContext);

  return context;
}
