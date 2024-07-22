import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { FC, useEffect, useRef, useState } from 'react';
import * as Styled from './styles';
import { Button, Link, Loading } from '../../atoms';
import { useNavigate, useLocation } from 'react-router-dom';
import { workspaces } from '@decipad/routing';
import { useClientEvents } from '@decipad/client-events';

interface SubscriptionPlansListProps {
  plans: (SubscriptionPlan | null)[];
  isCreatingNewWorkspace: boolean;
  hasFreeWorkspaceSlot: boolean;
  currentPlan?: string;
  selectedPlan?: string;
  workspaceId: string;
  setSelectedPlan: (value: string) => void;
  canProceed?: boolean | null | '';
  handleBillingButton: () => void;
  handleBackButton: () => void;
}

interface SubscriptionPlan {
  id: string;
  key: string;
  title?: string | null;
  price: number;
  currency?: string | null;
  description?: string | null;
}

const formatPrice = (price: number, currency: string = 'usd') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(price / 100);
};

export const SubscriptionPlansList: FC<SubscriptionPlansListProps> = ({
  plans,
  selectedPlan,
  setSelectedPlan,
  currentPlan,
  isCreatingNewWorkspace,
  hasFreeWorkspaceSlot,
  canProceed,
  handleBillingButton,
  handleBackButton,
  workspaceId,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const track = useClientEvents();

  const [isStripeInfoLoading, setStripeInfoLoading] = useState(false);
  const [billingButtonTitle, setBillingButtonTitle] = useState(
    'Continue to billing'
  );
  const hasFiredRef = useRef(false);

  useEffect(() => {
    if (!hasFiredRef.current) {
      track({
        segmentEvent: {
          type: 'action',
          action: 'Pricing Modal Viewed',
          props: { url: location.pathname, analytics_source: 'frontend' },
        },
      });
      hasFiredRef.current = true;
    }
  }, [location.pathname, track]);

  return (
    <>
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
                disabled={!isCreatingNewWorkspace && plan.key === currentPlan}
                asChild
                data-testid={`paywall_plan_item}`}
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
      <Styled.FakePlanItem>
        <Styled.PlanTitle>{'Enterprise'}</Styled.PlanTitle>
        <Styled.PlanDescription>
          <p>Need more credits? More control? More everything? </p>
          <Link href="mailto:info@decipad.com" color="plain">
            Get in touch
          </Link>{' '}
          and we'll figure it out!
        </Styled.PlanDescription>
      </Styled.FakePlanItem>
      <Styled.PaywallText>
        You can compare all the details on our{' '}
        <Link color="plain" href="https://www.decipad.com/pricing">
          pricing page
        </Link>
        .
      </Styled.PaywallText>
      <Styled.ButtonContainer>
        <Button
          type="primaryBrand"
          disabled={!canProceed || isStripeInfoLoading}
          testId="paywall_upgrade"
          onClick={() => {
            if (selectedPlan === 'free') {
              navigate(
                workspaces({}).workspace({ workspaceId }).createNew({}).$
              );
            } else {
              setStripeInfoLoading(true);
              setBillingButtonTitle('Loading info');
              handleBillingButton();
            }
          }}
        >
          {billingButtonTitle}
          {isStripeInfoLoading && (
            <Loading width="16px" style={{ marginLeft: '6px' }} />
          )}
        </Button>

        <Button type="secondary" onClick={handleBackButton}>
          Cancel
        </Button>
      </Styled.ButtonContainer>
    </>
  );
};
