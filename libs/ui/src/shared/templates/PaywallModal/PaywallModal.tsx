import { Modal } from '../../molecules';
import { ComponentProps, useMemo, useState } from 'react';
import { useStripePlans } from '@decipad/react-utils';
import * as Styled from './styles';
import { isFlagEnabled } from '@decipad/feature-flags';
import { useRouteParams } from 'typesafe-routes/react-router';
import { workspaces } from '@decipad/routing';
import { SubscriptionPlansList } from './SubscriptionPlansList';
import { SubscriptionPayment } from './SubscriptionPayment';
import { useClient } from 'urql';
import { GetStripeCheckoutSessionInfoDocument } from '@decipad/graphql-client';
import { getDefined } from '@decipad/utils';
import { useUserId } from './useUserId';
import { useOnConfirmPayment } from './helpers';

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

  const filteredPlans = useMemo(() => {
    return hideFreePlan ? plans.filter((plan) => plan?.key !== 'free') : plans;
  }, [hideFreePlan, plans]);

  const [selectedPlan, setSelectedPlan] = useState(DEFAULT_SELECTED_PLAN);

  const client = useClient();

  const userId = useUserId();

  const canProceed = useMemo(() => {
    if (isCreatingNewWorkspace) {
      return selectedPlan !== undefined;
    }
    return selectedPlan !== currentPlan && selectedPlan !== undefined;
  }, [selectedPlan, currentPlan, isCreatingNewWorkspace]);

  const [currentStage, setCurrentStage] = useState('choose-plan');
  const [clientSecret, setClientSecret] = useState('');

  const selectPlanInfo = useMemo(() => {
    return getDefined(plans.find((p) => p?.key === selectedPlan));
  }, [selectedPlan, plans]);

  const fetchBillingInfo = async (pId: string, resourceId: string) => {
    try {
      await client
        .query(GetStripeCheckoutSessionInfoDocument, {
          priceId: pId,
          workspaceId: resourceId,
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

  const onConfirmPayment = useOnConfirmPayment({
    workspaceId,
    selectedPlanInfo: selectPlanInfo,
  });

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
              fetchBillingInfo(
                selectPlanInfo?.id,
                isCreatingNewWorkspace ? userId : workspaceId
              );
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
