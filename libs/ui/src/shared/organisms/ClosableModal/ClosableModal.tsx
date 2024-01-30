/* eslint decipad/css-prop-named-variable: 0 */
import { ComponentProps, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClosableModalHeader, Modal } from '../../molecules';

type ClosableModalProps = ComponentProps<typeof Modal> &
  (
    | ({ title: string } & ComponentProps<typeof ClosableModalHeader>)
    | ({ noHeader: true } & Pick<
        ComponentProps<typeof ClosableModalHeader>,
        'closeAction'
      >)
  );

export const ClosableModal = ({
  children,
  closeAction,
  testId,
  ...props
}: ClosableModalProps): ReturnType<React.FC> => {
  const navigate = useNavigate();

  const handleClose = useCallback(() => {
    if (typeof closeAction === 'string') {
      navigate(closeAction);
    } else {
      closeAction();
    }
  }, [closeAction, navigate]);

  const header =
    'title' in props ? (
      <ClosableModalHeader {...props} closeAction={handleClose} />
    ) : null;

  return (
    <Modal closeAction={handleClose} testId={testId}>
      <div css={{ display: 'grid', rowGap: '12px' }}>
        {header}
        {children}
      </div>
    </Modal>
  );
};
