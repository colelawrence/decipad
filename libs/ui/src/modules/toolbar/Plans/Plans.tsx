import {
  useGetNotebookByIdQuery,
  useUnsafePlanMutation,
} from '@decipad/graphql-client';
import { useNotebookRoute } from '@decipad/routing';
import * as Popover from '@radix-ui/react-popover';
import { Toggle } from '../../../shared';
import * as Styled from '../styles';

// Update this if Stripe plans change
const subscriptionPlansNames = [
  { key: 'free', name: 'Free' },
  { key: 'pro', name: 'Pro (legacy)' },
  { key: 'personal', name: 'Plus' },
  { key: 'team', name: 'Business' },
  { key: 'none', name: 'None' },
];

export const Plans = () => {
  const [, unsafePlan] = useUnsafePlanMutation();
  const { notebookId } = useNotebookRoute();
  const [data] = useGetNotebookByIdQuery({ variables: { id: notebookId } });

  const { plan: planType, id: workspaceId } = data.data!.getPadById!.workspace!;
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Styled.Trigger>Plans</Styled.Trigger>
      </Popover.Trigger>
      <Popover.Content asChild align="end" sideOffset={16}>
        <Styled.Wrapper>
          {subscriptionPlansNames.map((plan) => (
            <Styled.ToggleLabel key={plan.key}>
              <Toggle
                variant="checkbox"
                active={
                  (plan.key === 'none' && planType == null) ||
                  plan.key === planType
                }
                ariaRoleDescription={`Toggle ${plan}`}
                onChange={(value) => {
                  if (!value) return;
                  switch (plan.key) {
                    case 'none':
                      unsafePlan({
                        workspaceId,
                        plan: null,
                      });
                      break;
                    default:
                      unsafePlan({
                        workspaceId,
                        plan: plan.key as any,
                      });
                      break;
                  }
                }}
              />
              {plan.name}
            </Styled.ToggleLabel>
          ))}
        </Styled.Wrapper>
      </Popover.Content>
    </Popover.Root>
  );
};
