import { ComponentProps } from 'react';
import { ClosableModalHeader, Modal } from '../../molecules';

type ClosableModalProps = ComponentProps<typeof ClosableModalHeader> &
  ComponentProps<typeof Modal>;

export const ClosableModal = ({
  children,
  ...props
}: ClosableModalProps): ReturnType<React.FC> => {
  return (
    <Modal closeAction={props.closeAction}>
      <ClosableModalHeader {...props} />
      {children}
    </Modal>
  );
};
