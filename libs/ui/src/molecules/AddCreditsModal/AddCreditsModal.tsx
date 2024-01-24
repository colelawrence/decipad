import {
  useGetCreditsPlansQuery,
  useGetNotebookMetaQuery,
} from '@decipad/graphql-client';
import { notebooks, useRouteParams } from '@decipad/routing';
import styled from '@emotion/styled';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { ClosableModal } from '../../organisms';
import { cssVar, p14Regular, p18Medium } from '../../primitives';
import { AddCreditsPaymentComponent } from './AddCreditsPaymentComponent';
import { env } from '@decipad/utils';

type AddCreditsModalProps = {
  closeAction: () => void;
  credits?: number;
  resourceId?: string;
};

const WrapperAddCreditsModal: React.FC<AddCreditsModalProps> = ({
  closeAction,
  credits,
}) => {
  const { notebook } = useRouteParams(notebooks({}).notebook);
  const [meta] = useGetNotebookMetaQuery({
    variables: { id: notebook.id },
  });
  const workspaceId = meta.data?.getPadById?.workspace?.id ?? '';

  return (
    <AddCreditsPaymentComponent
      resourceId={workspaceId}
      closeAction={closeAction}
      credits={credits ?? 0}
    />
  );
};

export const AddCreditsModal: React.FC<AddCreditsModalProps> = ({
  closeAction,
  resourceId,
}) => {
  const stripePromise = loadStripe(env.VITE_STRIPE_API_KEY);
  const [creditsPlans] = useGetCreditsPlansQuery();

  const creditsPlanData = creditsPlans.data?.getCreditsPlans;
  const defaultPlan = creditsPlanData?.plans.filter((p) => p.isDefault);

  return (
    <ClosableModal
      title={creditsPlanData?.title ?? ''}
      Heading="h2"
      closeAction={closeAction}
    >
      {(defaultPlan || []).map((plan) => {
        const price = Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: plan.currency ?? 'usd',
        }).format((plan?.price ?? 0) / 100);
        return (
          <>
            <ModalWrapper>
              <ModalSubtitle>
                <p>{plan?.credits} Credits</p>
                <p>{price}</p>
              </ModalSubtitle>
              <p css={p14Regular}>{plan?.description}</p>
            </ModalWrapper>
            <StripeWrapper>
              <Elements stripe={stripePromise}>
                {resourceId && (
                  <AddCreditsPaymentComponent
                    resourceId={resourceId}
                    closeAction={closeAction}
                    credits={plan?.credits ?? 0}
                  />
                )}
                {!resourceId && (
                  <WrapperAddCreditsModal
                    closeAction={closeAction}
                    credits={plan?.credits ?? 0}
                  />
                )}
              </Elements>
            </StripeWrapper>
          </>
        );
      })}
    </ClosableModal>
  );
};

const ModalSubtitle = styled.div(p18Medium, {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '8px',
});

const ModalWrapper = styled.div({
  borderRadius: '12px',
  border: `1px solid ${cssVar('borderSubdued')}`,
  padding: '20px',
});

const StripeWrapper = styled.div({
  marginTop: '16px',
});
