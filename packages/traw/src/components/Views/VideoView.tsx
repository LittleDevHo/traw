import BlockList from 'components/BlockPanel/BlockList';
import { Editor } from 'components/Editor';
import { StyledToolsPanelContainer } from 'components/ToolsPanel';
import Player from 'components/ToolsPanel/Player/Player';
import { useTRComponentsContext } from 'hooks/useCustomComponent';
import { useTRFunctionsContext } from 'hooks/useCustomFunctions';
import React from 'react';
import { breakpoints } from 'utils/breakpoints';

const VideoView = () => {
  const components = useTRComponentsContext();
  const functions = useTRFunctionsContext();

  return (
    <div className="flex-1 flex bg-traw-grey-200">
      <div className="flex-[2] relative">
        <div className="inset-3 right-0 flex flex-1 absolute">
          <div className="aspect-video w-full bg-white top-[50%] translate-y-[-50%] absolute rounded-xl overflow-hidden">
            <Editor components={components} readOnly={true} functions={functions} />
            <StyledToolsPanelContainer
              css={{ paddingBottom: 0 }}
              panelOpen={false}
              side={'bottom'}
              bp={breakpoints}
              debug={false}
            >
              <Player />
            </StyledToolsPanelContainer>
          </div>
        </div>
      </div>
      <div className="flex-1 bg-grey relative">
        <div className="inset-3 flex flex-1 absolute bg-white rounded-xl p-2 top-[71px]">
          <BlockList isRecording={false} />
        </div>
      </div>
    </div>
  );
};

export default VideoView;
