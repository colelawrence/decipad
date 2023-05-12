// eslint-disable-next-line import/no-extraneous-dependencies
import { css } from '@emotion/react';
import * as RadixDialog from '@radix-ui/react-dialog';
import { FC, ReactNode } from 'react';
import { showTransition, strongOpacity } from '../../primitives';

interface DialogProps {
  open: boolean;
  setOpen: (v: boolean) => void;
  children: ReactNode;
}

export const Dialog: FC<DialogProps> = ({ open, setOpen, children }) => {
  return (
    <RadixDialog.Root open={open} onOpenChange={setOpen}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay css={overlayStyles} />
        <RadixDialog.Content css={contentStyles}>
          {children}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
};

const overlayStyles = css({
  backgroundColor: `rgba(22, 31, 44, ${strongOpacity})`,
  position: 'fixed',
  zIndex: 100,
  inset: 0,
  animation: showTransition,
});

const contentStyles = css({
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 9999,

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});
