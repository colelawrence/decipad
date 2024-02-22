import { Modal } from '../../molecules';
import { ComponentProps, useCallback, useMemo, useState } from 'react';
import { Button, Link } from '../../atoms';
import { useStripePlans } from '@decipad/react-utils';
import { Maybe } from '@decipad/graphql-client';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import * as Styled from './styles';
import { isFlagEnabled } from '@decipad/feature-flags';
import { useRouteParams } from 'typesafe-routes/react-router';
import { workspaces } from '@decipad/routing';

type PaywallModalProps = Omit<ComponentProps<typeof Modal>, 'children'> & {
  workspaceId: string;
  userId: string;
  currentPlan?: Maybe<string>;
};

const DEFAULT_SELECTED_PLAN = isFlagEnabled('NEW_PAYMENTS')
  ? 'personal'
  : 'pro';

export const PaywallModal: React.FC<PaywallModalProps> = ({
  onClose,
  workspaceId,
  userId,
  currentPlan,
}) => {
  const params = useRouteParams(
    workspaces({}).workspace({ workspaceId }).upgrade
  );

  const shouldCreateNewWorkspace = params.newWorkspace === 'newWorkspace';

  const plans = useStripePlans(shouldCreateNewWorkspace ? userId : workspaceId);

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
            {plans.map((plan) =>
              plan ? (
                <ToggleGroup.Item
                  key={plan?.id}
                  value={plan?.key}
                  disabled={plan.key === currentPlan}
                  asChild
                >
                  <Styled.PlanItem>
                    <Styled.PlanTitle>
                      <Styled.PlanRadio />
                      {plan.title}
                      {plan.key === currentPlan && (
                        <Styled.PlanBadge>CURRENT PLAN</Styled.PlanBadge>
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
              disabled={!paymentLink}
              href={paymentLink}
              sameTab={true} // change this to false if you want to work on payments locally
              testId="paywall_upgrade_pro"
            >
              Continue to billing
            </Button>
          ) : (
            <Button type="primaryBrand" disabled>
              Pick a plan
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
