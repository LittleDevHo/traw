import { useCallback } from 'react';
import { useTrawApp } from './useTrawApp';

const usePlay = () => {
  const trawApp = useTrawApp();

  const handlePlayClick = useCallback(
    (blockId?: string) => {
      if (blockId) {
        trawApp.playBlock(blockId);
      } else {
        // TODO - play the whole document
      }
    },
    [trawApp],
  );

  return {
    handlePlayClick,
  };
};

export default usePlay;
