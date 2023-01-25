import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import classNames from 'classnames';
import { ErrorPopupProps } from './ErrorPopupProps';

export default function DefaultErrorPopup({ resetErrorBoundary }: ErrorPopupProps) {
  return (
    <Dialog.Root defaultOpen>
      <Dialog.Portal>
        <Dialog.Overlay className={classNames('fixed inset-0 bg-black bg-opacity-50 z-[250]')} />
        <Dialog.Content
          className={classNames(
            'flex flex-col',
            'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
            'bg-white rounded-xl border',
            'w-full max-w-md',
            'px-4 py-3',
            'z-[251]',
          )}
        >
          <Dialog.Title className="flex gap-2 items-center text-lg font-bold">Oops!</Dialog.Title>
          <Dialog.Description>
            <p className="py-4">
              Sorry for the inconvenience. There wes a glitch.
              <br />
              You can try to refresh the page.
            </p>
          </Dialog.Description>
          <button
            className={classNames(
              'px-4 py-1',
              'ring-0 outline-0',
              'bg-traw-purple hover:bg-traw-purple-light',
              'transition-colors duration-300',
              'rounded-full',
              'text-white',
              'self-end',
            )}
            onClick={resetErrorBoundary}
          >
            Reset
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
