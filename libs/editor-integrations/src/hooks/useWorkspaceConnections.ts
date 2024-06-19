import {
  ExternalDataSourceFragmentFragment,
  ExternalProvider,
  useGetExternalDataSourcesWorkspaceQuery,
} from '@decipad/graphql-client';
import { useMemo } from 'react';

export const useWorkspaceConnections = (
  workspaceId: string,
  provider: ExternalProvider | Array<ExternalProvider>
): Array<ExternalDataSourceFragmentFragment> => {
  const [{ data: wsDatasources }] = useGetExternalDataSourcesWorkspaceQuery({
    variables: {
      workspaceId,
    },
  });

  return useMemo(() => {
    const compFn: (source: ExternalDataSourceFragmentFragment) => boolean = (
      s
    ) =>
      Array.isArray(provider)
        ? provider.includes(s.provider)
        : s.provider === provider;

    return wsDatasources?.getExternalDataSourcesWorkspace.filter(compFn) ?? [];
  }, [wsDatasources?.getExternalDataSourcesWorkspace, provider]);
};
