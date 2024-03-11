import { getAnalytics } from '@decipad/client-events';
import {
  GetWorkspaceByIdDocument,
  GetWorkspaceByIdQuery,
  GetWorkspaceByIdQueryVariables,
  GetWorkspacesWithNotebooksDocument,
  GetWorkspacesWithoutNotebooksQuery,
  GetWorkspacesWithoutNotebooksQueryVariables,
  SubPlansFragment,
} from '@decipad/graphql-client';
import { useAiUsage } from '@decipad/react-contexts';
import { workspaces } from '@decipad/routing';
import { useToast } from '@decipad/toast';
import { useNavigate } from 'react-router-dom';
import { useRouteParams } from 'typesafe-routes/react-router';
import { useClient } from 'urql';

interface UseOnConfirmPaymentProps {
  workspaceId: string;
  selectedPlanInfo: SubPlansFragment;
}

function getLatestWorkspace<T extends { id: string; createdAt?: string }>(
  objects: Array<T>
): string {
  let latest = '';
  let latestData = 0;

  for (const workspace of objects) {
    if (workspace.createdAt == null || workspace.createdAt === '') {
      continue;
    }

    const unixTime = new Date(workspace.createdAt).getTime();

    if (unixTime > latestData) {
      latestData = unixTime;
      latest = workspace.id;
    }
  }

  return latest;
}

export function useOnConfirmPayment({
  workspaceId,
  selectedPlanInfo,
}: UseOnConfirmPaymentProps) {
  const params = useRouteParams(
    workspaces({}).workspace({ workspaceId }).upgrade
  );
  const isCreatingNewWorkspace = !!params.newWorkspace;

  const client = useClient();

  const { tokensQuotaLimit, increaseQuotaLimit } = useAiUsage();
  const toast = useToast();
  const analytics = getAnalytics();
  const navigate = useNavigate();

  return function onConfirmPayment(paymentStatus: string) {
    const aiCreditsPlan = selectedPlanInfo.credits ?? 0;
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
        if (isCreatingNewWorkspace) {
          client
            .query<
              GetWorkspacesWithoutNotebooksQuery,
              GetWorkspacesWithoutNotebooksQueryVariables
            >(
              GetWorkspacesWithNotebooksDocument,
              {},
              { requestPolicy: 'network-only' }
            )
            .toPromise()
            .then((res) => {
              if ((tokensQuotaLimit || 0) < aiCreditsPlan) {
                increaseQuotaLimit(aiCreditsPlan);
              }
              toast.success(
                `New workspace created with ${selectedPlanInfo.title} plan`
              );

              const wsId = getLatestWorkspace(res.data?.workspaces ?? []);

              navigate(workspaces({}).workspace({ workspaceId: wsId }).$);
            });

          return;
        }

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
              `Workspace upgraded to ${selectedPlanInfo.title} plan`
            );
          });
      }, 2000);

      if (analytics == null) {
        return;
      }

      analytics.track('Purchase', {
        category: 'Subscription',
        subCategory: 'Plan',
        resource: {
          type: 'workspace',
          id: workspaceId,
        },
        plan: selectedPlanInfo.title,
      });
    } else {
      if (analytics == null) {
        return;
      }

      analytics.track('Purchase', {
        category: 'Subscription',
        subCategory: 'Plan',
        resource: {
          type: 'workspace',
          id: workspaceId,
        },
        plan: selectedPlanInfo.title,
        error: {
          code: 'Stripe checkout error',
          message: `Check error message on Stripe dashboard for plan: ${selectedPlanInfo.key}`,
        },
      });
    }
  };
}
