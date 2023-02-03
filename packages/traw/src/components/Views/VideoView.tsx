import classNames from 'classnames';
import BlockList from 'components/BlockPanel/BlockList';
import { Editor } from 'components/Editor';
import { StyledToolsPanelContainer } from 'components/ToolsPanel';
import Player from 'components/ToolsPanel/Player/Player';
import { useTRComponentsContext } from 'hooks/useCustomComponent';
import { useTRFunctionsContext } from 'hooks/useCustomFunctions';
import useDeviceDetect from 'hooks/useDeviceDetect';
import React from 'react';
import { breakpoints } from 'utils/breakpoints';

const VideoView = () => {
  const components = useTRComponentsContext();
  const functions = useTRFunctionsContext();

  const { isBrowser } = useDeviceDetect();

  return (
    <div className={classNames('flex-1 flex bg-traw-purple-dark ', isBrowser ? 'flex-row' : 'flex-col')}>
      <div className={classNames('relative', isBrowser ? 'flex-[2]' : 'flex-[0_0_60vw] z-10')}>
        <div className={classNames('flex flex-1 absolute', isBrowser ? 'right-0 inset-3' : 'inset-1')}>
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
      <div className={classNames('flex-1 bg-grey relative')}>
        <div
          className={classNames(
            'flex flex-1 absolute bg-white rounded-xl p-2',
            isBrowser ? 'inset-3 top-[12px]' : 'inset-1 top-0',
          )}
        >
          <BlockList isRecording={false} />
        </div>
      </div>
    </div>
  );
};

export default VideoView;
