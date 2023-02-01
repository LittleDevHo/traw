import '@fontsource/caveat-brush';
import '@fontsource/crimson-pro';
import '@fontsource/recursive';
import '@fontsource/source-code-pro';
import '@fontsource/source-sans-pro';
import { TrawContext } from 'hooks';
import React from 'react';
import { TrawApp } from 'state';
import { TrawDocument } from 'types';
import { TEST_DOCUMENT_1, TEST_USER_1 } from 'utils/testUtil';
import './index.css';

import Views from 'components/Views/Views';
import { TRComponentsContext, TRCustomComponentsType } from 'hooks/useCustomComponent';
import { TRCustomFunctionsType, TRFunctionsContext } from 'hooks/useCustomFunctions';
import HeaderPanel from 'components/Views/HeaderPanel';

export interface TrawProps {
  app?: TrawApp;
  document?: TrawDocument;
  components?: TRCustomComponentsType;
  functions?: TRCustomFunctionsType;
}

const Traw = ({ app, document, components, functions }: TrawProps) => {
  // Create a new app when the component mounts.
  const [trawApp] = React.useState(
    app ??
      new TrawApp({
        user: TEST_USER_1,
        document: document || TEST_DOCUMENT_1,
      }),
  );

  React.useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.document?.fonts) return;

    function refreshBoundingBoxes() {
      trawApp.app.refreshBoundingBoxes();
    }
    window.document.fonts.addEventListener('loadingdone', refreshBoundingBoxes);
    return () => {
      window.document.fonts.removeEventListener('loadingdone', refreshBoundingBoxes);
    };
  }, [trawApp]);

  // Use the `key` to ensure that new selector hooks are made when the id changes
  return (
    <TrawContext.Provider value={trawApp}>
      <TRComponentsContext.Provider value={components || {}}>
        <TRFunctionsContext.Provider value={functions || {}}>
          <HeaderPanel />
          <Views />
        </TRFunctionsContext.Provider>
      </TRComponentsContext.Provider>
    </TrawContext.Provider>
  );
};

export { Traw };
