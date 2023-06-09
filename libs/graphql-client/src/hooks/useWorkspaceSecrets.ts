import {
  useCreateWorkspaceSecretMutation,
  useGetWorkspaceSecretsQuery,
} from '..';
import { useMutationResultHandler } from '../utils/useMutationResultHandler';
import {
  Secret,
  SecretInput,
  useDeleteWorkspaceSecretMutation,
} from '../generated';

export const useWorkspaceSecrets = (workspaceId: string) => {
  const [{ data: secretsData }, refetch] = useGetWorkspaceSecretsQuery({
    variables: { workspaceId },
  });

  const createSecret = useMutationResultHandler(
    useCreateWorkspaceSecretMutation()[1],
    'Failed to create secret'
  );

  const removeSecret = useMutationResultHandler(
    useDeleteWorkspaceSecretMutation()[1],
    'Failed to remove secret'
  );

  const add = async (secret: SecretInput) => {
    await createSecret({
      workspaceId,
      secret,
    });
    await refetch({ requestPolicy: 'network-only' });
  };

  const remove = async (secret: Secret) => {
    await removeSecret({ secretId: secret.id });
    await refetch({ requestPolicy: 'network-only' });
  };

  const secrets = secretsData?.getWorkspaceSecrets;

  return { secrets, add, remove };
};
