import { Modal } from '../../molecules';
import { ComponentProps, useCallback, useMemo, useState } from 'react';
import { Button, Link } from '../../atoms';
import { useStripePlans } from '@decipad/react-utils';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import * as Styled from './styles';
import { isFlagEnabled } from '@decipad/feature-flags';
import { useRouteParams } from 'typesafe-routes/react-router';
import { workspaces } from '@decipad/routing';

type PaywallModalProps = Omit<ComponentProps<typeof Modal>, 'children'> & {
  workspaceId: string;
  userId: string;
  hasFreeWorkspaceSlot: boolean;
  currentPlan?: string;
};

const DEFAULT_SELECTED_PLAN = isFlagEnabled('NEW_PAYMENTS')
  ? 'personal'
  : 'pro';

export const PaywallModal: React.FC<PaywallModalProps> = ({
  onClose,
  workspaceId,
  userId,
  hasFreeWorkspaceSlot,
  currentPlan,
}) => {
  const params = useRouteParams(
    workspaces({}).workspace({ workspaceId }).upgrade
  );

  const isCreatingNewWorkspace = !!params.newWorkspace;

  const hideFreePlan = !hasFreeWorkspaceSlot && isCreatingNewWorkspace;

  const plans = useStripePlans(isCreatingNewWorkspace ? userId : workspaceId);

  const filteredPlans = useMemo(() => {
    return hideFreePlan ? plans.filter((plan) => plan?.key !== 'free') : plans;
  }, [hideFreePlan, plans]);

  const [selectedPlan, setSelectedPlan] = useState(DEFAULT_SELECTED_PLAN);

  const formatPrice = useCallback((price: number, currency: string = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(price / 100);
  }, []);

  const paymentLink = useMemo(() => {
    return plans.find((plan) => plan?.key === selectedPlan)?.paymentLink;
  }, [plans, selectedPlan]);

  const canProceed = useMemo(() => {
    if (isCreatingNewWorkspace) {
      return selectedPlan !== undefined;
    }
    return (
      paymentLink && selectedPlan !== currentPlan && selectedPlan !== undefined
    );
  }, [paymentLink, selectedPlan, currentPlan, isCreatingNewWorkspace]);

  return (
    <Modal defaultOpen={true} onClose={onClose}>
      <Styled.PaywallContainer>
        <Styled.PaywallTitle>Choose plan</Styled.PaywallTitle>
        <ToggleGroup.Root
          type="single"
          orientation="vertical"
          value={selectedPlan}
          onValueChange={(value: string) => {
            if (value) setSelectedPlan(value);
          }}
          asChild
        >
          <Styled.PlanContainer>
            {filteredPlans.map((plan) =>
              plan ? (
                <ToggleGroup.Item
                  key={plan?.id}
                  value={plan?.key}
                  disabled={!isCreatingNewWorkspace && plan.key === currentPlan}
                  asChild
                  data-testid={`paywall_plan_item_${plan?.key}`}
                >
                  <Styled.PlanItem>
                    <Styled.PlanTitle>
                      <Styled.PlanRadio />
                      {plan.title}
                      {!isCreatingNewWorkspace && plan.key === currentPlan && (
                        <Styled.PlanBadge>CURRENT PLAN</Styled.PlanBadge>
                      )}
                      {isCreatingNewWorkspace &&
                        hasFreeWorkspaceSlot &&
                        plan.key === 'free' && (
                          <Styled.PlanBadge>
                            1 FREE WORKSPACE AVAILABLE
                          </Styled.PlanBadge>
                        )}
                    </Styled.PlanTitle>
                    <Styled.PlanPrice>
                      {formatPrice(plan.price, plan.currency ?? 'usd')}
                      <Styled.PlanPriceSuffix>/mo</Styled.PlanPriceSuffix>
                    </Styled.PlanPrice>
                    <Styled.PlanDescription>
                      {plan.description}
                    </Styled.PlanDescription>
                  </Styled.PlanItem>
                </ToggleGroup.Item>
              ) : null
            )}
          </Styled.PlanContainer>
        </ToggleGroup.Root>
        <Styled.PaywallText>
          You can compare all the details on our{' '}
          <Link color="plain" href="https://www.decipad.com/pricing">
            pricing page
          </Link>
          .
        </Styled.PaywallText>
        <Styled.ButtonContainer>
          {paymentLink ? (
            <Button
              type="primaryBrand"
              disabled={!canProceed}
              href={paymentLink}
              sameTab={true} // change this to false if you want to work on payments locally
              testId="paywall_upgrade_pro"
            >
              Continue to billing
            </Button>
          ) : (
            // if there's no payment link, we assume it is a free plan
            <Button
              type="primaryBrand"
              disabled={!canProceed}
              testId="paywall_create_workspace"
              href={workspaces({}).workspace({ workspaceId }).createNew({}).$}
            >
              Create free workspace
            </Button>
          )}
          <Button type="secondary" onClick={onClose}>
            Cancel
          </Button>
        </Styled.ButtonContainer>
      </Styled.PaywallContainer>
    </Modal>
  );
};
