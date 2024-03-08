import { FC } from 'react';
import * as Styled from './styles';
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js';
import { env } from '@decipad/utils';
import { loadStripe } from '@stripe/stripe-js';

interface SubscriptionPaymentProps {
  clientSecret: string;
  handlePaymentButton: (paymentStatus: string) => void;
}

export const SubscriptionPayment: FC<SubscriptionPaymentProps> = ({
  handlePaymentButton,
  clientSecret,
}) => {
  const stripePromise = loadStripe(env.VITE_STRIPE_API_KEY);

  const stripeOptions = {
    clientSecret,
    onComplete: () => {
      handlePaymentButton('success');
    },
  };

  return (
    <Styled.PaymentFormWrapper>
      <EmbeddedCheckoutProvider stripe={stripePromise} options={stripeOptions}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </Styled.PaymentFormWrapper>
  );
};
