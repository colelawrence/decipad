import tables from '@decipad/tables';
import { cancelSubscriptionFromWorkspaceId } from '../workspaceSubscriptions/subscription.helpers';

export const getWorkspaceMembersCount = async (workspaceId: string) => {
  const data = await tables();

  const workspaceResourceName = `/workspaces/${workspaceId}`;
  const members = await data.permissions.query({
    IndexName: 'byResource',
    KeyConditionExpression: 'resource_uri = :resource_uri',
    ExpressionAttributeValues: {
      ':resource_uri': workspaceResourceName,
    },
  });

  return members.Count;
};

export const cancelWorkspaceSubscriptionPayment = async (
  workspaceId: string
) => {
  await cancelSubscriptionFromWorkspaceId(workspaceId);
};
