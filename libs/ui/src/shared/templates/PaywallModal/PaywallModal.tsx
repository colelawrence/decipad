import { Modal } from '../../molecules';
import { ComponentProps, useMemo, useState } from 'react';
import { useStripePlans } from '@decipad/react-utils';
import * as Styled from './styles';
import { isFlagEnabled } from '@decipad/feature-flags';
import { useRouteParams } from 'typesafe-routes/react-router';
import { workspaces } from '@decipad/routing';
import { getAnalytics } from '@decipad/client-events';
import { useAiUsage } from '@decipad/react-contexts';
import { SubscriptionPlansList } from './SubscriptionPlansList';
import { SubscriptionPayment } from './SubscriptionPayment';
import { useClient } from 'urql';
import {
  GetWorkspaceByIdDocument,
  GetWorkspaceByIdQuery,
  GetWorkspaceByIdQueryVariables,
  GetStripeCheckoutSessionInfoDocument,
} from '@decipad/graphql-client';
import { useToast } from '@decipad/toast';

type PaywallModalProps = Omit<ComponentProps<typeof Modal>, 'children'> & {
  workspaceId: string;
  hasFreeWorkspaceSlot: boolean;
  currentPlan?: string;
  onClose: () => void;
};

const DEFAULT_SELECTED_PLAN = isFlagEnabled('NEW_PAYMENTS')
  ? 'personal'
  : 'pro';

export const PaywallModal: React.FC<PaywallModalProps> = ({
  onClose,
  workspaceId,
  hasFreeWorkspaceSlot,
  currentPlan,
}) => {
  const params = useRouteParams(
    workspaces({}).workspace({ workspaceId }).upgrade
  );
  const isCreatingNewWorkspace = !!params.newWorkspace;

  const hideFreePlan = !hasFreeWorkspaceSlot && isCreatingNewWorkspace;
  let modalContent: JSX.Element;
  let paywallTitle: string;

  const plans = useStripePlans();

  const analytics = getAnalytics();
  const { tokensQuotaLimit, increaseQuotaLimit } = useAiUsage();

  const filteredPlans = useMemo(() => {
    return hideFreePlan ? plans.filter((plan) => plan?.key !== 'free') : plans;
  }, [hideFreePlan, plans]);

  const [selectedPlan, setSelectedPlan] = useState(DEFAULT_SELECTED_PLAN);

  const client = useClient();

  const canProceed = useMemo(() => {
    if (isCreatingNewWorkspace) {
      return selectedPlan !== undefined;
    }
    return selectedPlan !== currentPlan && selectedPlan !== undefined;
  }, [selectedPlan, currentPlan, isCreatingNewWorkspace]);

  const [currentStage, setCurrentStage] = useState('choose-plan');
  const [clientSecret, setClientSecret] = useState('');

  const selectPlanInfo = useMemo(() => {
    return plans.find((p) => p?.key === selectedPlan);
  }, [selectedPlan, plans]);

  const fetchBillingInfo = async (pId: string, wId: string) => {
    try {
      await client
        .query(GetStripeCheckoutSessionInfoDocument, {
          priceId: pId,
          workspaceId: wId,
        })
        .toPromise()
        .then((result) => {
          setClientSecret(
            result.data?.getStripeCheckoutSessionInfo?.clientSecret || ''
          );
          setCurrentStage('make-payment');
        });
    } catch (error) {
      console.error('Error fetching billing info:', error);
    }
  };

  const toast = useToast();

  const onConfirmPayment = (paymentStatus: string) => {
    const aiCreditsPlan = Number(selectPlanInfo?.credits) || 0;
    if (paymentStatus === 'success') {
      /*
       * When a Stripe subscription is completed, 2 events are sent to Decipad: one to the FE where this function is executed
       * and another one to our webhook (where all the logic is applied to the workspace and store all the info in our databases).
       * Because they happens concurrently, when this function is executed, we don't know if the webhook has finished to execute
       * all the operations (such as, marking the current workspace as premium). This way, we need this function to run after the
       * webhook finishes its operations. The only way so far is to set a 2s delay to retrieve the updated information of the workspace
       * // TODO: ask @pgte for a better solution
       */
      setTimeout(() => {
        client
          .query<GetWorkspaceByIdQuery, GetWorkspaceByIdQueryVariables>(
            GetWorkspaceByIdDocument,
            { workspaceId },
            { requestPolicy: 'network-only' }
          )
          .toPromise()
          .then(() => {
            if ((tokensQuotaLimit || 0) < aiCreditsPlan) {
              increaseQuotaLimit(aiCreditsPlan);
            }
            toast.success(
              `Workspace upgraded to ${selectPlanInfo?.title} plan`
            );
          });
      }, 2000);

      if (analytics) {
        analytics.track('Purchase', {
          category: 'Subscription',
          subCategory: 'Plan',
          resource: {
            type: 'workspace',
            id: workspaceId,
          },
          plan: selectPlanInfo?.title,
        });
      }
    } else if (analytics) {
      analytics.track('Purchase', {
        category: 'Subscription',
        subCategory: 'Plan',
        resource: {
          type: 'workspace',
          id: workspaceId,
        },
        plan: selectPlanInfo?.title,
        error: {
          code: 'Stripe checkout error',
          message: `Check error message on Stripe dashboard for plan: ${selectPlanInfo?.key}`,
        },
      });
    }
  };

  switch (currentStage) {
    case 'choose-plan': {
      modalContent = (
        <SubscriptionPlansList
          plans={filteredPlans}
          isCreatingNewWorkspace={isCreatingNewWorkspace}
          hasFreeWorkspaceSlot={hasFreeWorkspaceSlot}
          setSelectedPlan={setSelectedPlan}
          selectedPlan={selectedPlan}
          currentPlan={currentPlan}
          handleBillingButton={() => {
            if (selectPlanInfo?.id) {
              fetchBillingInfo(selectPlanInfo?.id, workspaceId);
            }
          }}
          handleBackButton={onClose}
          canProceed={canProceed}
          workspaceId={workspaceId}
        />
      );
      paywallTitle = 'Choose a plan';
      break;
    }
    case 'make-payment': {
      modalContent = selectPlanInfo ? (
        <SubscriptionPayment
          handlePaymentButton={onConfirmPayment}
          clientSecret={clientSecret}
        />
      ) : (
        <></>
      );
      paywallTitle = `Upgrade to ${selectPlanInfo?.title}`;
      break;
    }
    default: {
      modalContent = <></>;
      paywallTitle = '';
    }
  }

  return (
    <Modal
      defaultOpen={true}
      onClose={onClose}
      title={paywallTitle}
      stickyToTopProps={{
        top: '15%',
        transform: 'translate(-50%, 0)',
      }}
    >
      <Styled.PaywallContainer>{modalContent}</Styled.PaywallContainer>
    </Modal>
  );
};
