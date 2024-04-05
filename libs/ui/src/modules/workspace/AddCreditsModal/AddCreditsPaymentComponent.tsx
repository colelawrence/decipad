import { css } from '@emotion/react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Button, LoadingIndicator } from '../../../shared';
import { useUpdateResourceQuotaLimitMutation } from '@decipad/graphql-client';
import { FormEventHandler, useCallback, useState } from 'react';
import { useAiUsage } from '@decipad/react-contexts';
import { getAnalytics } from '@decipad/client-events';
import { cssVarHex } from 'libs/ui/src/primitives';

type AddCreditsPaymentComponentProps = {
  resourceId: string;
  closeAction: () => void;
  credits: number | string;
};

export const AddCreditsPaymentComponent: React.FC<
  AddCreditsPaymentComponentProps
> = ({ resourceId, closeAction, credits }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [, UpdateResourceQuotaLimit] = useUpdateResourceQuotaLimitMutation();

  const cardComponentStyles = {
    style: {
      base: {
        color: cssVarHex('textHeavy'),
      },
    },
  };

  const updateNewQuotaLimit = useCallback(
    async (paymentMethodId: string) => {
      return UpdateResourceQuotaLimit({
        resourceType: 'workspaces',
        resourceId,
        paymentMethodId,
      });
    },
    [resourceId, UpdateResourceQuotaLimit]
  );

  const { increaseQuotaLimit } = useAiUsage();
  const [loading, setLoadingState] = useState(false);

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) {
      return;
    }
    const card = elements.getElement(CardElement);

    // Create a PaymentMethod using the card element
    if (card) {
      const result = await stripe.createPaymentMethod({
        type: 'card',
        card,
      });

      if (result.error) {
        getAnalytics().then(({ track }) =>
          track('Purchase', {
            category: 'Credits',
            subCategory: 'AI',
            resource: {
              type: 'workspace',
              id: resourceId,
            },
            amount: credits,
            error: {
              code: result.error.code,
              message: result.error.message,
            },
          })
        );
        console.error(result.error.message);
      } else {
        setLoadingState(true);
        const newCreditsLimitResult = await updateNewQuotaLimit(
          result.paymentMethod.id
        );
        if (newCreditsLimitResult.data) {
          getAnalytics().then(({ track }) =>
            track('Purchase', {
              category: 'Credits',
              subCategory: 'AI',
              resource: {
                type: 'workspace',
                id: resourceId,
              },
              amount: credits,
            })
          );

          const newLimit =
            newCreditsLimitResult.data.updateExtraAiAllowance?.newQuotaLimit ??
            0;
          increaseQuotaLimit(newLimit);
          setLoadingState(false);
          closeAction();
        }
      }
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <CardElement options={cardComponentStyles} />
        {!loading && (
          <Button type="primaryBrand" styles={buyNowButtonStyles}>
            Buy Now
          </Button>
        )}
        {loading && <LoadingIndicator />}
      </form>
    </div>
  );
};

const buyNowButtonStyles = css({
  marginTop: '20px',
  width: '100%',
});
