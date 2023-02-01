import BlockList from 'components/BlockPanel/BlockList';
import { Editor } from 'components/Editor';
import { useTrawApp } from 'hooks';
import React from 'react';

const DocView = () => {
  const app = useTrawApp();
  const state = app.useStore();
  const { document } = state;

  return (
    <div className="flex flex-1 h-full justify-center bg-traw-purple-dark pt-4">
      <div className="w-screen md:max-w-[720px] px-[20px] flex flex-1 pt-4  flex-col justify-start bg-white">
        <h1 className="overflow-hidden text-ellipsis text-3xl font-bold  text-traw-grey-dark text-center mb-6 mt-5">
          {document.name}
        </h1>
        <div className="aspect-video">
          <Editor readOnly={true} />
        </div>
        <BlockList isRecording={false} />
      </div>
    </div>
  );
};

export default DocView;
