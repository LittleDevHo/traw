import {
  ArrowTopRightIcon,
  CursorArrowIcon,
  FilePlusIcon,
  ImageIcon,
  Pencil1Icon,
  TextIcon,
} from '@radix-ui/react-icons';
import * as React from 'react';
import { breakpoints } from 'utils/breakpoints';

import * as Separator from '@radix-ui/react-separator';
import { useTldrawApp } from 'hooks/useTldrawApp';

import { TDShapeType, TDSnapshot } from '@tldraw/tldraw';
import { Panel } from 'components/Primitives/Panel';
import { ToolButtonWithTooltip } from 'components/Primitives/ToolButton';
import { useTrawApp } from 'hooks';
import useDeviceDetect from 'hooks/useDeviceDetect';
import { EraserIcon } from 'icons/eraser';
import TemplateIcon from 'icons/SvgTemplate';
import { UndoIcon } from 'icons/undo';
import { styled } from 'stitches.config';
import { ActionButton } from './ActionButton';
import { ShapesMenu } from './ShapesMenu';
import { StyleMenu } from './StyleMenu';

const activeToolSelector = (s: TDSnapshot) => s.appState.activeTool;
const toolLockedSelector = (s: TDSnapshot) => s.appState.isToolLocked;
const dockPositionState = (s: TDSnapshot) => s.settings.dockPosition;

export const PrimaryTools = React.memo(function PrimaryTools() {
  const { isBrowser } = useDeviceDetect();

  const trawApp = useTrawApp();
  const app = useTldrawApp();

  const activeTool = app.useStore(activeToolSelector);

  const isToolLocked = app.useStore(toolLockedSelector);
  const dockPosition = app.useStore(dockPositionState);

  const selectSelectTool = React.useCallback(() => {
    app.selectTool('select');
  }, [app]);

  const selectEraseTool = React.useCallback(() => {
    app.selectTool('erase');
  }, [app]);

  const selectDrawTool = React.useCallback(() => {
    app.selectTool(TDShapeType.Draw);
  }, [app]);

  const selectArrowTool = React.useCallback(() => {
    app.selectTool(TDShapeType.Arrow);
  }, [app]);

  const selectTextTool = React.useCallback(() => {
    app.selectTool(TDShapeType.Text);
  }, [app]);

  // const selectStickyTool = React.useCallback(() => {
  //   app.selectTool(TDShapeType.Sticky);
  // }, [app]);

  const uploadMedias = React.useCallback(
    async (type: string) => {
      trawApp.openAsset(type);
    },
    [trawApp],
  );

  const undo = React.useCallback(() => {
    app.undo();
  }, [app]);

  const redo = React.useCallback(() => {
    app.redo();
  }, [app]);

  const panelStyle = dockPosition === 'bottom' || dockPosition === 'top' ? 'row' : 'column';

  return (
    <>
      <StyledPanel side="center" id="TD-PrimaryTools" style={{ flexDirection: panelStyle }} bp={breakpoints}>
        <ToolButtonWithTooltip
          variant="primary"
          kbd={'1'}
          label={'select'}
          onClick={selectSelectTool}
          isActive={activeTool === 'select'}
          id="TD-PrimaryTools-CursorArrow"
        >
          <CursorArrowIcon />
        </ToolButtonWithTooltip>
        <ToolButtonWithTooltip
          variant="primary"
          kbd={'2'}
          label={'draw'}
          onClick={selectDrawTool}
          isActive={activeTool === TDShapeType.Draw}
          id="TD-PrimaryTools-Pencil"
        >
          <Pencil1Icon />
        </ToolButtonWithTooltip>
        <ToolButtonWithTooltip
          variant="primary"
          kbd={'3'}
          label={'eraser'}
          onClick={selectEraseTool}
          isActive={activeTool === 'erase'}
          id="TD-PrimaryTools-Eraser"
        >
          <EraserIcon />
        </ToolButtonWithTooltip>
        <ShapesMenu activeTool={activeTool} isToolLocked={isToolLocked} />
        <ToolButtonWithTooltip
          variant="primary"
          kbd={'8'}
          label={'arrow'}
          onClick={selectArrowTool}
          isLocked={isToolLocked}
          isActive={activeTool === TDShapeType.Arrow}
          id="TD-PrimaryTools-ArrowTopRight"
        >
          <ArrowTopRightIcon />
        </ToolButtonWithTooltip>
        <ToolButtonWithTooltip
          variant="primary"
          kbd={'9'}
          label={'text'}
          onClick={selectTextTool}
          isLocked={isToolLocked}
          isActive={activeTool === TDShapeType.Text}
          id="TD-PrimaryTools-Text"
        >
          <TextIcon />
        </ToolButtonWithTooltip>
        {/* <ToolButtonWithTooltip
        variant="primary"
        kbd={'0'}
        label={'sticky'}
        onClick={selectStickyTool}
        isActive={activeTool === TDShapeType.Sticky}
        id="TD-PrimaryTools-Pencil2"
      >
        <Pencil2Icon />
      </ToolButtonWithTooltip> */}
        <ToolButtonWithTooltip
          variant="primary"
          label={'image'}
          onClick={() => uploadMedias('computer')}
          id="TD-PrimaryTools-Image"
        >
          <ImageIcon />
        </ToolButtonWithTooltip>
        <ToolButtonWithTooltip
          variant="primary"
          label={'file'}
          onClick={() => uploadMedias('computer')}
          id="TD-PrimaryTools-File"
        >
          <FilePlusIcon />
        </ToolButtonWithTooltip>
        <ToolButtonWithTooltip
          variant="primary"
          label={'template'}
          onClick={() => uploadMedias('traw')}
          id="TD-PrimaryTools-Template"
        >
          <TemplateIcon />
        </ToolButtonWithTooltip>
        <Separator.Root className="SeparatorRoot mx-2 my-1 w-[2px]  bg-traw-grey" decorative orientation="vertical" />
        <ToolButtonWithTooltip label={'undo'} onClick={undo} id="TD-PrimaryTools-Undo" variant="undo">
          <UndoIcon />
        </ToolButtonWithTooltip>
        <ToolButtonWithTooltip label={'redo'} onClick={redo} id="TD-PrimaryTools-Redo" variant="undo">
          <UndoIcon flipHorizontal />
        </ToolButtonWithTooltip>

        {!isBrowser && (
          <div className="flex ml-3">
            <StyleMenu />
            <ActionButton />
          </div>
        )}
      </StyledPanel>
    </>
  );
});

const StyledPanel = styled(Panel, {
  borderRadius: 0,
  flex: 1,
  padding: '10px 10px',
  justifyContent: 'center',
  variants: {
    bp: {
      micro: {
        padding: '6px 0px',
      },
      medium: {
        borderRadius: '9999px',
        padding: '$2',
      },
    },
  },
});
