import {
  useGetNotebookByIdQuery,
  useUnsafePlanMutation,
} from '@decipad/graphql-client';
import { useNotebookRoute } from '@decipad/routing';
import * as Popover from '@radix-ui/react-popover';
import { Toggle } from '../../../shared';
import * as Styled from '../styles';

const subscriptionPlansNames = [
  'Enterprise',
  'Free',
  'Personal',
  'Pro',
  'Team',
  'None',
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
            <Styled.ToggleLabel key={plan}>
              <Toggle
                variant="checkbox"
                active={
                  (plan === 'None' && planType == null) ||
                  plan.toLocaleLowerCase() === planType
                }
                ariaRoleDescription={`Toggle ${plan}`}
                onChange={(value) => {
                  if (!value) return;
                  switch (plan) {
                    case 'None':
                      unsafePlan({
                        workspaceId,
                        plan: null,
                      });
                      break;
                    default:
                      unsafePlan({
                        workspaceId,
                        plan: plan.toLocaleLowerCase() as any,
                      });
                      break;
                  }
                }}
              />
              {plan}
            </Styled.ToggleLabel>
          ))}
        </Styled.Wrapper>
      </Popover.Content>
    </Popover.Root>
  );
};
