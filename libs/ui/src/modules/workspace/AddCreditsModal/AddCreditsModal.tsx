import { useMemo } from 'react';
import styled from '@emotion/styled';
import { Elements } from '@stripe/react-stripe-js';
import {
  useGetCreditsPlansQuery,
  useGetNotebookMetaQuery,
} from '@decipad/graphql-client';
import { notebooks, useRouteParams } from '@decipad/routing';
import { env } from '@decipad/client-env';
import { Modal } from '../../../shared';
import { cssVar, p14Regular, p18Medium } from '../../../primitives';
import { AddCreditsPaymentComponent } from './AddCreditsPaymentComponent';

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

interface StripeDialogueProps {
  resourceId?: string;
  closeAction: () => void;
  planCredits?: number;
}

const StripeDialogue = ({
  resourceId,
  closeAction,
  planCredits = 0,
}: StripeDialogueProps) => {
  const stripePromise = useMemo(async () => {
    const { loadStripe } = await import('@stripe/stripe-js');
    return loadStripe(env.VITE_STRIPE_API_KEY);
  }, []);
  return (
    <Elements stripe={stripePromise}>
      {resourceId && (
        <AddCreditsPaymentComponent
          resourceId={resourceId}
          closeAction={closeAction}
          credits={planCredits}
        />
      )}
      {!resourceId && (
        <WrapperAddCreditsModal
          closeAction={closeAction}
          credits={planCredits}
        />
      )}
    </Elements>
  );
};

export const AddCreditsModal: React.FC<AddCreditsModalProps> = ({
  closeAction,
  resourceId,
}) => {
  const [creditsPlans] = useGetCreditsPlansQuery();

  const creditsPlanData = creditsPlans.data?.getCreditsPlans;
  const defaultPlan = creditsPlanData?.plans.filter((p) => p.isDefault);

  return (
    <Modal
      title={creditsPlanData?.title ?? ''}
      defaultOpen={true}
      onClose={closeAction}
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
              <StripeDialogue
                resourceId={resourceId}
                closeAction={closeAction}
                planCredits={plan?.credits}
              ></StripeDialogue>
            </StripeWrapper>
          </>
        );
      })}
    </Modal>
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
