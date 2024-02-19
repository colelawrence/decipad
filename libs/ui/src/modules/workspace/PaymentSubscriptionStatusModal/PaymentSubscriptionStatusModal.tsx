import { useState } from 'react';
import { css } from '@emotion/react';
import { Modal, Button } from '../../../shared';

type PaymentSubscriptionStatusModalProps = {
  readonly paymentSubscriptionStatus: string;
  readonly templatesHref: string;
};
export const PaymentSubscriptionStatusModal: React.FC<
  PaymentSubscriptionStatusModalProps
> = ({ paymentSubscriptionStatus, templatesHref }) => {
  const isSuccess = paymentSubscriptionStatus === 'paid';
  const modalData = isSuccess
    ? {
        title: "You've been upgraded to Decipad Pro!",
        text: 'Invite new members to workspace and build larger notebooks together!',
        closeButton: 'Explore',
      }
    : {
        title: 'Payment has failed. Please try again.',
        text: 'Please check your e-mail for further details or contact support, so we could process it manually.',
        closeButton: 'Close',
      };

  const [open, setOpen] = useState(true);

  return (
    <Modal
      title={modalData.title}
      open={open}
      onOpenChange={setOpen}
      defaultOpen={true}
      testId="subscription_status_modal"
    >
      <p>{modalData.text}</p>

      <div css={buttonWrapperStyles}>
        <Button type="primary" onClick={() => setOpen(false)}>
          {modalData.closeButton}
        </Button>
        {isSuccess && (
          <Button type="secondary" href={templatesHref}>
            Browse templates
          </Button>
        )}
      </div>
    </Modal>
  );
};

const buttonWrapperStyles = css({
  marginTop: '24px',
  '& button, a': {
    display: 'inline-block',
    marginRight: '8px',
  },
});
