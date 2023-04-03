import { useCallback, useEffect } from 'react';
import { captureException } from '@sentry/browser';
import {
  ExternalDataSource,
  ExternalDataSourcesContextValue,
} from '@decipad/interfaces';
import { getDefined } from '@decipad/utils';
import {
  ExternalDataSourceCreateInput,
  useCreateExternalDataSourceMutation,
  useGetExternalDataSourcesQuery,
} from '@decipad/graphql-client';

export const useExternalDataSources = (
  notebookId: string
): ExternalDataSourcesContextValue => {
  const [externalDataSources] = useGetExternalDataSourcesQuery({
    variables: { notebookId },
  });

  const [, createExternalDataSource] = useCreateExternalDataSourceMutation();

  useEffect(() => {
    if (externalDataSources.error) {
      console.error(externalDataSources.error);
      captureException(externalDataSources.error);
    }
  }, [externalDataSources.error]);

  return {
    externalDataSources: (externalDataSources.data?.getExternalDataSources
      .items ?? []) as ExternalDataSource[],
    createExternalDataSource: useCallback(
      async (dataSource) => {
        const results = await createExternalDataSource({
          dataSource: dataSource as ExternalDataSourceCreateInput,
        });
        if (results.error) {
          captureException(results.error);
        }
        return getDefined(
          results.data?.createExternalDataSource
        ) as ExternalDataSource;
      },
      [createExternalDataSource]
    ),
  };
};
