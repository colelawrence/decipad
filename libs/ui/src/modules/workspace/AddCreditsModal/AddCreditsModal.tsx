import styled from '@emotion/styled';
import {
  useGetCreditsPlansQuery,
  useGetNotebookMetaQuery,
} from '@decipad/graphql-client';
import { useNotebookRoute } from '@decipad/routing';
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
  const { notebookId } = useNotebookRoute();
  const [meta] = useGetNotebookMetaQuery({
    variables: { id: notebookId },
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

interface PaymentDialogueProps {
  resourceId?: string;
  closeAction: () => void;
  planCredits?: number;
}

const PaymentDialogue = ({
  resourceId,
  closeAction,
  planCredits = 0,
}: PaymentDialogueProps) => {
  return (
    <>
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
    </>
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
              <PaymentDialogue
                resourceId={resourceId}
                closeAction={closeAction}
                planCredits={plan?.credits}
              ></PaymentDialogue>
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
