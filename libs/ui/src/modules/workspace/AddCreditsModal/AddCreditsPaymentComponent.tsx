import { css } from '@emotion/react';
import { Button } from '../../../shared';
import { useCallback } from 'react';

type AddCreditsPaymentComponentProps = {
  resourceId: string;
  closeAction: () => void;
  credits: number | string;
};

export const AddCreditsPaymentComponent: React.FC<
  AddCreditsPaymentComponentProps
> = ({ closeAction }) => {
  const handleClose = useCallback(() => {
    closeAction();
  }, [closeAction]);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h3>Payment Processing Disabled</h3>
      <p>
        Payment processing is currently disabled. Please contact support for
        assistance.
      </p>
      <Button
        type="primaryBrand"
        styles={buyNowButtonStyles}
        onClick={handleClose}
      >
        Close
      </Button>
    </div>
  );
};

const buyNowButtonStyles = css({
  marginTop: '20px',
  width: '100%',
});
