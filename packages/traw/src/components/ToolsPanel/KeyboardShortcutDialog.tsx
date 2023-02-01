import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';
import { IconButton } from 'components/Primitives/IconButton';
import { Kbd } from 'components/Primitives/Kbd';
import { RowButton } from 'components/Primitives/RowButton';
import { useContainer } from 'hooks/useTldrawApp';
import * as React from 'react';
import { styled } from 'stitches.config';
import { breakpoints } from 'utils/breakpoints';

export function KeyboardShortcutDialog({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
  const container = useContainer();

  const shortcuts = {
    Tools: [
      { label: 'Select', kbd: '1' },
      { label: 'Draw', kbd: '2' },
      { label: 'Eraser', kbd: '3' },
      { label: 'Rectangle', kbd: '4' },
      { label: 'Ellipse', kbd: '5' },
      { label: 'Triangle', kbd: '6' },
      { label: 'Line', kbd: '7' },
      { label: 'Arrow', kbd: '8' },
      { label: 'Text', kbd: '9' },
      // { label: 'Sticky', kbd: '0' },
    ],
    View: [
      { label: 'Zoom In', kbd: '#+' },
      { label: 'Zoom Out', kbd: '#-' },
      { label: 'Zoom to 100%', kbd: '⇧+0' },
      { label: 'Zoom to Fit', kbd: '⇧+1' },
      { label: 'Zoom to Selection', kbd: '⇧+2' },
      { label: 'Zoom to Next Image', kbd: 'PgUp' },
      { label: 'Zoom to Prev Image', kbd: 'PgDn' },
      // { label: intl.formatMessage({ id: 'preferences.dark.mode' }), kbd: '#⇧D' },
      // { label: intl.formatMessage({ id: 'preferences.focus.mode' }), kbd: '#.' },
      // { label: intl.formatMessage({ id: 'preferences.show.grid' }), kbd: '#⇧G' },
    ],
    Transform: [
      { label: 'Flip Horizontal', kbd: '⇧H' },
      { label: 'Flip Vertical', kbd: '⇧V' },
      {
        label: `Lock / Unlock`,
        kbd: '#⇧L',
      },
      {
        label: `Move To Front`,
        kbd: '⇧]',
      },
      {
        label: 'Move Forward',
        kbd: ']',
      },
      {
        label: 'Move Backward',
        kbd: '[',
      },
      {
        label: 'Move To Back',
        kbd: '⇧[',
      },
    ],
    // File: [
    // { label: intl.formatMessage({ id: 'new.project' }), kbd: '#N' },
    // { label: intl.formatMessage({ id: 'open' }), kbd: '#O' },
    // { label: intl.formatMessage({ id: 'save' }), kbd: '#S' },
    // { label: intl.formatMessage({ id: 'save.as' }), kbd: '#⇧S' },
    // { label: intl.formatMessage({ id: 'upload.media' }), kbd: '#U' },
    // ],
    Edit: [
      { label: 'Undo', kbd: '#Z' },
      { label: 'Redo', kbd: '#⇧Z' },
      { label: 'Cut', kbd: '#X' },
      { label: 'Copy', kbd: '#C' },
      { label: 'Paste', kbd: '#V' },
      { label: 'Select All', kbd: '#A' },
      { label: 'Delete', kbd: '⌫' },
      { label: 'Duplicate', kbd: '#D' },
    ],
  };

  return (
    <Dialog.Root onOpenChange={onOpenChange}>
      {/* // todo: hide if no keyboard is attached */}
      <Dialog.Trigger asChild>
        <RowButton id="TD-HelpItem-Keyboard" variant="wide">
          Keyboard shortcuts
        </RowButton>
      </Dialog.Trigger>
      <Dialog.Portal container={container.current}>
        <DialogOverlay />
        <DialogContent>
          <DialogTitle>
            Keyboard shortcuts
            <Dialog.Close asChild>
              <DialogIconButton>
                <Cross2Icon />
              </DialogIconButton>
            </Dialog.Close>
          </DialogTitle>
          <StyledColumns bp={breakpoints}>
            {Object.entries(shortcuts).map(([key, value]) => (
              <StyledSection key={key}>
                <Label>
                  {key}
                  {/* <FormattedMessage id={`menu.${key.toLocaleLowerCase()}`} /> */}
                </Label>
                <ContentItem>
                  {value.map((shortcut) => (
                    <StyledItem key={shortcut.label}>
                      {shortcut.label}
                      <Kbd variant="menu">{shortcut.kbd}</Kbd>
                    </StyledItem>
                  ))}
                </ContentItem>
              </StyledSection>
            ))}
          </StyledColumns>
        </DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

const Label = styled('h3', {
  fontSize: '$2',
  color: '$text',
  fontFamily: '$ui',
  margin: 0,
  paddingBottom: '$5',
});

const StyledSection = styled('div', {
  breakInside: 'avoid',
  paddingBottom: 24,
});

const ContentItem = styled('ul', {
  listStyleType: 'none',
  width: '100%',
  padding: 0,
  margin: 0,
});

const StyledItem = styled('li', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: 32,
  minHeight: 32,
  width: '100%',
  outline: 'none',
  color: '$text',
  fontFamily: '$ui',
  fontWeight: 400,
  fontSize: '$1',
  borderRadius: 4,
  userSelect: 'none',
  margin: 0,
  padding: '0 0',
});

const DialogContent = styled(Dialog.Content, {
  borderRadius: 6,
  boxShadow: 'hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px',
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 'fit-content',
  maxWidth: '90vw',
  maxHeight: '74vh',
  overflowY: 'auto',
  padding: 25,
  zIndex: 9999,
  pointerEvents: 'all',
  background: '$panel',
  '&:focus': { outline: 'none' },
});

const StyledColumns = styled('div', {
  maxWidth: '100%',
  width: 'fit-content',
  height: 'fit-content',
  overflowY: 'auto',
  columnGap: 64,
  variants: {
    bp: {
      mobile: {
        columns: 1,
        [`& ${StyledSection}`]: {
          minWidth: '0px',
        },
      },
      small: {
        columns: 2,
        [`& ${StyledSection}`]: {
          minWidth: '200px',
        },
      },
      medium: {
        columns: 3,
      },
      large: {
        columns: 3,
      },
    },
  },
});

const DialogOverlay = styled(Dialog.Overlay, {
  backgroundColor: '$overlay',
  position: 'fixed',
  inset: 0,
  zIndex: 9998,
});

const DialogIconButton = styled(IconButton, {
  fontFamily: 'inherit',
  borderRadius: '100%',
  height: 25,
  width: 25,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '$text',
  cursor: 'pointer',
  '&:hover': { backgroundColor: '$hover' },
});

const DialogTitle = styled(Dialog.Title, {
  fontFamily: '$body',
  fontSize: '$3',
  color: '$text',
  paddingBottom: 32,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  margin: 0,
});
