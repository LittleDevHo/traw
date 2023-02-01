import DocumentView from 'components/Doc/DocumentView';
import Title from 'components/DocumentMenuPanel/Title';
import { useTrawApp } from 'hooks';
import { useTRFunctionsContext } from 'hooks/useCustomFunctions';
import React, { useEffect } from 'react';

const DocView = () => {
  const app = useTrawApp();
  const state = app.useStore();
  const { document } = state;
  const functions = useTRFunctionsContext();

  useEffect(() => {
    app.updateBlockViewportMap();
  }, [app]);

  return (
    <div className="w-full h-full absolute bg-traw-grey-50 overflow-scroll">
      <div className="w-full overflow-auto">
        <div className="ml-[50%] translate-x-[-50%] max-w-[720px] px-[20px] flex pt-16 flex-col justify-start bg-white overflow-auto pb-8">
          <Title
            title={document.name}
            canEdit={document.canEdit}
            handleChangeTitle={functions?.handleChangeDocumentTitle}
          />
          <DocumentView />
        </div>
      </div>
    </div>
  );
};

export default DocView;
