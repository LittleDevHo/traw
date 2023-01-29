import BlockList from 'components/BlockPanel/BlockList';
import { Editor } from 'components/Editor';
import Title from 'components/HeaderPanel/Title';
import { useTrawApp } from 'hooks';
import { useTRFunctionsContext } from 'hooks/useCustomFunctions';
import React from 'react';

const DocView = () => {
  const app = useTrawApp();
  const state = app.useStore();
  const { document } = state;
  const functions = useTRFunctionsContext();

  return (
    <div className="flex flex-1 h-full justify-center bg-traw-grey-50">
      <div className="max-w-[720px] px-[20px] flex flex-1 pt-16 flex-col justify-start bg-white">
        <Title
          title={document.name}
          canEdit={document.canEdit}
          handleChangeTitle={functions?.handleChangeDocumentTitle}
        />
        <div className="aspect-video">
          <Editor readOnly={true} />
        </div>
        <BlockList handlePlayClick={() => null} isRecording={false} />
      </div>
    </div>
  );
};

export default DocView;
