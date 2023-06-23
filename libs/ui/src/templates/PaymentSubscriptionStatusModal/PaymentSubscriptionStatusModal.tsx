import { useState } from 'react';
import { css } from '@emotion/react';
import { ClosableModal } from '../../organisms';
import { Button } from '../../atoms';

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

  const [isClosed, closeModal] = useState(false);

  if (isClosed) {
    return null;
  }

  return (
    <ClosableModal
      title={modalData.title}
      Heading="h1"
      closeAction={() => {
        closeModal(true);
      }}
    >
      <p>{modalData.text}</p>

      <div css={buttonWrapperStyles}>
        <Button type="primary" onClick={() => closeModal(true)}>
          {modalData.closeButton}
        </Button>
        {isSuccess && (
          <Button type="secondary" href={templatesHref}>
            Browse templates
          </Button>
        )}
      </div>
    </ClosableModal>
  );
};

const buttonWrapperStyles = css({
  marginTop: '24px',
  '& button, a': {
    display: 'inline-block',
    marginRight: '8px',
  },
});
