import { useTrawApp } from 'hooks';
import LoadingCircular from 'icons/loading-circular';
import React from 'react';

export interface DocImageViewerProps {
  blockId: string;
}

const DocImageViewer = ({ blockId }: DocImageViewerProps) => {
  // const parentApp = useTrawApp();
  // const [trawApp] = React.useState(
  //   new TrawApp({
  //     user: {
  //       ...TEST_USER_1,
  //       id: userId,
  //     },
  //     document: TEST_DOCUMENT_1,
  //   }),
  // );

  // useEffect(() => {
  //   const records = parentApp.sortedRecords;
  //   const filteredRecords = records.filter((record) => record.start <= time);
  //   trawApp.addRecords(filteredRecords);
  // }, [parentApp.sortedRecords, time, trawApp]);
  const app = useTrawApp();
  const block = app.useStore((state) => state.blocks[blockId]);

  if (!block) return null;
  return (
    <div className="aspect-video flex relative flex-wrap justify-center content-center">
      {block.captureUrl ? (
        <img src={block.captureUrl} />
      ) : (
        <LoadingCircular className="animate-spin h-10 w-10 text-traw-purple" />
      )}

      {/* <TrawContext.Provider value={trawApp}>
        <Editor readOnly />
      </TrawContext.Provider> */}
    </div>
  );
};

export default DocImageViewer;
