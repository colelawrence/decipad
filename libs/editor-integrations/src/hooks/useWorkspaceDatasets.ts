import {
  useGetExternalDataSourcesWorkspaceQuery,
  useGetWorkspaceAttachmentsQuery,
} from '@decipad/graphql-client';
import { Dataset } from '@decipad/interfaces';
import { useMemo } from 'react';

/**
 * Returns all workspace datasets. These include.
 * - Attachments to the workspace (CSV files).
 * - CSVs imported through a link.
 */
export const useWorkspaceDatasets = (workspaceId: string): Array<Dataset> => {
  const [{ data: workspaceAttachmentsData }] = useGetWorkspaceAttachmentsQuery({
    variables: { workspaceId },
  });

  const [{ data: workspaceDataSourcesData }] =
    useGetExternalDataSourcesWorkspaceQuery({
      variables: { workspaceId },
    });

  return useMemo(() => {
    const workspaceAttachments =
      workspaceAttachmentsData?.getWorkspaceById?.attachments ?? [];

    const workspaceDataSources =
      workspaceDataSourcesData?.getExternalDataSourcesWorkspace ?? [];

    return [
      ...workspaceAttachments.map(
        (a): Dataset => ({
          type: 'attachment',
          dataset: a,
        })
      ),
      ...workspaceDataSources
        .filter((source) => source.provider === 'csv')
        .map((source): Dataset => ({ type: 'data-source', dataset: source })),
    ];
  }, [
    workspaceAttachmentsData?.getWorkspaceById?.attachments,
    workspaceDataSourcesData?.getExternalDataSourcesWorkspace,
  ]);
};
