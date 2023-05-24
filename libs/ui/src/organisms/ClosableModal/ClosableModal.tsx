import { ComponentProps, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClosableModalHeader, Modal } from '../../molecules';

type ClosableModalProps = ComponentProps<typeof ClosableModalHeader> &
  ComponentProps<typeof Modal>;

export const ClosableModal = ({
  children,
  closeAction,
  ...props
}: ClosableModalProps): ReturnType<React.FC> => {
  const navigate = useNavigate();
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      if (typeof closeAction === 'string') {
        navigate(closeAction);
      } else {
        closeAction();
      }
    }, 300);
  }, [closeAction, navigate]);

  return (
    <Modal closeAction={handleClose} fadeOut={isClosing}>
      <div css={{ display: 'grid', rowGap: '12px' }}>
        <ClosableModalHeader {...props} closeAction={handleClose} />
        {children}
      </div>
    </Modal>
  );
};
