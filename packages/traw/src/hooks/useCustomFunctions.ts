import * as React from 'react';

export interface TRCustomFunctionsType {
  handleChangeDocumentTitle?: (newValue: string) => void;
  handleNavigateHome?: () => void;
  handleLanguageClick?: () => void;
  onError?: (error: Error) => void;
  onReset?: () => void;
}

export const TRFunctionsContext = React.createContext({} as TRCustomFunctionsType);

export function useTRFunctionsContext() {
  const context = React.useContext(TRFunctionsContext);

  return context;
}
