import { Modal } from '../../molecules';
import { ComponentProps, useMemo, useState } from 'react';
import { useStripePlans } from '@decipad/react-utils';
import * as Styled from './styles';
import { SubscriptionPlansList } from './SubscriptionPlansList';
import { getDefined } from '@decipad/utils';
import { useUserId } from './useUserId';

type PaywallModalProps = Omit<ComponentProps<typeof Modal>, 'children'> & {
  workspaceId: string;
  hasFreeWorkspaceSlot: boolean;
  currentPlan?: string;
  onClose: () => void;
  isCreatingNewWorkspace: boolean;
};

const DEFAULT_SELECTED_PLAN = 'personal';

export const PaywallModal: React.FC<PaywallModalProps> = ({
  onClose,
  workspaceId,
  hasFreeWorkspaceSlot,
  currentPlan,
  isCreatingNewWorkspace = false,
}) => {
  const hideFreePlan = !hasFreeWorkspaceSlot && isCreatingNewWorkspace;

  // this is needed while we still have active subscription on the old Pro plan
  const plans = useStripePlans().filter((plan) => !plan.isDefault);

  const filteredPlans = useMemo(() => {
    return hideFreePlan ? plans.filter((plan) => plan?.key !== 'free') : plans;
  }, [hideFreePlan, plans]);

  const [selectedPlan, setSelectedPlan] = useState(DEFAULT_SELECTED_PLAN);

  const userId = useUserId();

  const selectPlanInfo = useMemo(() => {
    return getDefined(plans.find((p) => p?.key === selectedPlan));
  }, [selectedPlan, plans]);

  const fetchBillingInfo = async (_pId: string, _resourceId: string) => {
    // Stripe is disabled, show error message
    // eslint-disable-next-line no-alert
    alert(
      'Payment processing is currently disabled. Please contact support for assistance.'
    );
  };

  const canProceed = useMemo(() => {
    if (isCreatingNewWorkspace) {
      return selectedPlan !== undefined;
    }
    return selectedPlan !== currentPlan && selectedPlan !== undefined;
  }, [selectedPlan, currentPlan, isCreatingNewWorkspace]);

  return (
    <Modal
      defaultOpen={true}
      onClose={onClose}
      title={`Choose a plan ${
        isCreatingNewWorkspace ? 'for your new workspace' : ''
      }`}
    >
      <Styled.PaywallContainer>
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
      </Styled.PaywallContainer>
    </Modal>
  );
};
