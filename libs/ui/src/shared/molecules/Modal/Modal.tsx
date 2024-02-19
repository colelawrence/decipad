/* eslint decipad/css-prop-named-variable: 0 */
import { FC, ReactNode, useCallback, useState } from 'react';

import * as Dialog from '@radix-ui/react-dialog';
import * as Styled from './styles';
import { Close } from 'libs/ui/src/icons';

type ModalContentProps = {
  readonly children?: ReactNode | ReactNode[];
  readonly title?: string;
  readonly testId?: string;
  readonly size?: keyof typeof Styled.sizes;
};

const ModalContent: FC<ModalContentProps> = ({
  children,
  testId,
  title,
  size = 'md',
}): ReturnType<FC> => (
  <Dialog.Portal forceMount>
    <Dialog.Overlay asChild>
      <Styled.ModalOverlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
    </Dialog.Overlay>
    <Dialog.Content asChild role="dialog" data-testid={testId}>
      <Styled.ModalWrapper size={size}>
        <Styled.ModalContent
          initial={{ y: 120, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -40, opacity: 0, scale: 0.9 }}
        >
          {title && (
            <Styled.ModalHeader>
              <Styled.ModalTitle>{title}</Styled.ModalTitle>
              <Dialog.Close asChild>
                <Styled.ModalCloseButton
                  aria-label="Close"
                  data-testid="closable-modal"
                >
                  <Close />
                </Styled.ModalCloseButton>
              </Dialog.Close>
            </Styled.ModalHeader>
          )}
          {children}
        </Styled.ModalContent>
      </Styled.ModalWrapper>
    </Dialog.Content>
  </Dialog.Portal>
);

type UncontrolledModalProps = ModalContentProps & {
  readonly trigger?: ReactNode;
  readonly defaultOpen?: boolean;
  readonly modal?: boolean;
  readonly onClose?: () => void;
};

const UncontrolledModal = ({
  children,
  testId,
  trigger,
  title,
  defaultOpen,
  size = 'md',
  modal = true,
  onClose,
}: UncontrolledModalProps): ReturnType<React.FC> => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleOpenChange = useCallback(
    (o: boolean) => {
      if (onClose && !o) {
        onClose();
      }
      setIsOpen(o);
    },
    [onClose]
  );

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange} modal={modal}>
      {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
      {isOpen && (
        <ModalContent title={title} testId={testId} size={size}>
          {children}
        </ModalContent>
      )}
    </Dialog.Root>
  );
};

type ControlledModalProps = UncontrolledModalProps & {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
};

const ControlledModal = ({
  children,
  testId,
  trigger,
  title,
  size = 'md',
  modal = true,
  open,
  onOpenChange,
  defaultOpen,
  onClose,
}: ControlledModalProps): ReturnType<React.FC> => {
  const handleOpenChange = useCallback(
    (o: boolean) => {
      if (onClose && !o) {
        onClose();
      }
      onOpenChange(o);
    },
    [onClose, onOpenChange]
  );

  return (
    <Dialog.Root
      open={open}
      onOpenChange={handleOpenChange}
      defaultOpen={defaultOpen}
      modal={modal}
    >
      {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
      {open && (
        <ModalContent title={title} testId={testId} size={size}>
          {children}
        </ModalContent>
      )}
    </Dialog.Root>
  );
};

type ModalProps = ControlledModalProps | UncontrolledModalProps;

/**
 * Modal Component
 *
 * This component renders a modal dialog box. It can operate in either a controlled
 * or uncontrolled mode. In controlled mode, the visibility of the modal is managed
 * by the parent component through 'open' and 'onOpenChange' props. In uncontrolled
 * mode, the modal manages its own state internally.
 *
 * @example
 * // Controlled usage
 * <Modal
 *   open={open}
 *   onOpenChange={handleOpenChange}
 * >
 *   <p>Modal Content Here</p>
 * </Modal>
 *
 * @example
 * // Uncontrolled usage
 * <Modal>
 *   <p>Modal Content Here</p>
 * </Modal>
 */

export const Modal = ({
  children,
  ...props
}: ModalProps): ReturnType<React.FC> => {
  if ('open' in props && 'onOpenChange' in props) {
    return <ControlledModal {...props}>{children}</ControlledModal>;
  }

  return <UncontrolledModal {...props}>{children}</UncontrolledModal>;
};
