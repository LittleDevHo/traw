import { GitHubLogoIcon, QuestionMarkIcon, TwitterLogoIcon } from '@radix-ui/react-icons';
import * as Popover from '@radix-ui/react-popover';
import { TDSnapshot } from '@tldraw/tldraw';

import { Divider } from 'components/Primitives/Divider';
import { MenuContent } from 'components/Primitives/MenuContent';
import { RowButton } from 'components/Primitives/RowButton';
import { SmallIcon } from 'components/Primitives/SmallIcon';
import { useTldrawApp } from 'hooks/useTldrawApp';
import { useTrawApp } from 'hooks/useTrawApp';
import { DiscordIcon } from 'icons/DiscordIcon';
import * as React from 'react';
import { styled } from 'stitches.config';
import { breakpoints } from 'utils/breakpoints';
import { KeyboardShortcutDialog } from './KeyboardShortcutDialog';

import { ArrowBottomRightIcon } from '@radix-ui/react-icons';
import useDeviceDetect from 'hooks/useDeviceDetect';
import { isEmptyDocumentSelector, HelperContainer } from 'components/HelperContainer/HelperContainer';

const isDebugModeSelector = (s: TDSnapshot) => s.settings.isDebugMode;
const dockPositionState = (s: TDSnapshot) => s.settings.dockPosition;

export function HelpPanel() {
  const app = useTldrawApp();
  const isDebugMode = app.useStore(isDebugModeSelector);
  const side = app.useStore(dockPositionState);

  const trawApp = useTrawApp();
  const panelOpen = trawApp.useStore((state) => state.editor.isPanelOpen);

  const [isKeyboardShortcutsOpen, setIsKeyboardShortcutsOpen] = React.useState(false);

  const appPadding = trawApp.useStore((state) => state.editor.padding);

  const isEmptyDocument = trawApp.useStore(isEmptyDocumentSelector);

  const { isBrowser } = useDeviceDetect();

  return (
    <Popover.Root>
      <PopoverAnchor
        dir="ltr"
        debug={isDebugMode}
        side={side}
        bp={breakpoints}
        panelOpen={panelOpen}
        css={{ $$right: `${appPadding.right + 10}px` }}
      >
        {isEmptyDocument && isBrowser && (
          <HelperContainer className="flex-col bottom-full right-0  items-center mr-4 ">
            <div>Shortcuts and communities</div>
            <ArrowBottomRightIcon className="w-16 h-12 fill-current " />
          </HelperContainer>
        )}
        <Popover.Trigger dir="ltr" asChild>
          <HelpButton>
            <QuestionMarkIcon />
          </HelpButton>
        </Popover.Trigger>
      </PopoverAnchor>
      <Popover.Content dir="ltr" align="end" side="top" alignOffset={10} sideOffset={8} asChild>
        <StyledContent style={{ visibility: isKeyboardShortcutsOpen ? 'hidden' : 'visible' }}>
          {/* <LanguageMenuDropdown /> */}
          <KeyboardShortcutDialog onOpenChange={setIsKeyboardShortcutsOpen} />
          <Divider />
          <Links />
        </StyledContent>
      </Popover.Content>
    </Popover.Root>
  );
}

// const LanguageMenuDropdown = () => {
//   return (
//     <DropdownMenu.Root dir="ltr">
//       <DropdownMenu.Trigger asChild>
//         <RowButton variant="wide" hasArrow>
//           Language
//         </RowButton>
//       </DropdownMenu.Trigger>
//       {/* <LanguageMenu /> */}
//     </DropdownMenu.Root>
//   );
// };

const linksData = [
  { id: 'github', icon: GitHubLogoIcon, url: 'https://github.com/trawhq/traw', label: 'Github' },
  { id: 'twitter', icon: TwitterLogoIcon, url: 'https://twitter.com/trawHQ', label: 'Twitter' },
  { id: 'discord', icon: DiscordIcon, url: 'https://discord.gg/suhCyddPnQ', label: 'Discord' },
];

const Links = () => {
  return (
    <>
      {linksData.map((item) => (
        <a key={item.id} href={item.url} target="_blank" rel="noreferrer">
          <RowButton id={`TD-Link-${item.id}`} variant="wide">
            {item.label}
            <SmallIcon>
              <item.icon />
            </SmallIcon>
          </RowButton>
        </a>
      ))}
    </>
  );
};

const HelpButton = styled('button', {
  width: 32,
  height: 32,
  borderRadius: '100%',
  display: 'flex',
  padding: 0,
  justifyContent: 'center',
  alignItems: 'center',
  outline: 'none',
  backgroundColor: '$panel',
  cursor: 'pointer',
  boxShadow: '$panel',
  border: '1px solid $panelContrast',
  color: '$text',
  '& svg': {
    height: 12,
    width: 12,
  },
});

export const StyledContent = styled(MenuContent, {
  width: 'fit-content',
  height: 'fit-content',
  minWidth: 200,
  maxHeight: 380,
  overflowY: 'auto',
  '& *': {
    boxSizing: 'border-box',
  },
  '& a': {
    outline: 'none',
  },
  variants: {
    variant: {
      horizontal: {
        flexDirection: 'row',
      },
      menu: {
        minWidth: 128,
      },
    },
  },
});

const PopoverAnchor = styled(Popover.Anchor, {
  position: 'absolute',
  zIndex: 200,
  right: 10,
  bottom: 20,
  width: 32,
  height: 32,
  variants: {
    debug: {
      true: {},
      false: {},
    },
    bp: {
      mobile: {},
      small: {},
      medium: {
        right: '$$right',
      },
      large: {},
    },
    side: {
      top: {},
      left: {},
      right: {},
      bottom: {},
    },
    panelOpen: {
      true: {},
      false: {},
    },
  },
  compoundVariants: [
    {
      bp: 'mobile',
      side: 'bottom',
      panelOpen: true,
      css: {
        bottom: 60,
      },
    },
    {
      bp: 'mobile',
      side: 'bottom',
      panelOpen: false,
      css: {
        bottom: 60,
      },
    },
    {
      bp: 'medium',
      side: 'bottom',
      panelOpen: true,
      css: {
        bottom: 20,
      },
    },
    {
      bp: 'medium',
      side: 'bottom',
      panelOpen: false,
      css: {
        bottom: 20,
      },
    },
  ],
});
