import { Editor } from 'components/Editor';
import { TrawContext, useTrawApp } from 'hooks';
import React, { useEffect } from 'react';
import { TrawApp } from 'state';
import { TEST_DOCUMENT_1, TEST_USER_1 } from 'utils/testUtil';

export interface DocImageViewerProps {
  time: number;
  userId: string;
}

const DocImageViewer = ({ time, userId }: DocImageViewerProps) => {
  const parentApp = useTrawApp();
  const [trawApp] = React.useState(
    new TrawApp({
      user: {
        ...TEST_USER_1,
        id: userId,
      },
      document: TEST_DOCUMENT_1,
    }),
  );

  useEffect(() => {
    const records = parentApp.sortedRecords;
    const filteredRecords = records.filter((record) => record.start <= time);
    trawApp.addRecords(filteredRecords);
  }, [parentApp.sortedRecords, time, trawApp]);

  return (
    <div className="aspect-video flex relative">
      <TrawContext.Provider value={trawApp}>
        <Editor readOnly />
      </TrawContext.Provider>
    </div>
  );
};

export default DocImageViewer;
