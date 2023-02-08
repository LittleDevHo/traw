import DocumentView from 'components/Doc/DocumentView';
import { Editor } from 'components/Editor';
import { useTrawApp } from 'hooks';
import React, { useEffect } from 'react';

const DocView = () => {
  const app = useTrawApp();
  const state = app.useStore();
  const { document, records } = state;
  const blocks = app.sortedBlocks;
  const recordsLength = Object.keys(records).length;

  useEffect(() => {
    app.updateDocModeData();
  }, [app, blocks.length, recordsLength]);

  return (
    <div className="w-full h-full  bg-traw-purple-dark overflow-scroll relative pt-7">
      <div className="w-full overflow-auto flex justify-center ">
        <div className="max-w-[720px] px-[20px] flex flex-col justify-start bg-white overflow-auto pb-8">
          <h1 className="overflow-hidden text-ellipsis text-3xl font-bold  text-traw-grey-dark text-center mb-6 mt-5">
            {document.name}
          </h1>

          <DocumentView />
        </div>
      </div>
      <div className="hidden">
        <Editor />
      </div>
    </div>
  );
};

export default DocView;
