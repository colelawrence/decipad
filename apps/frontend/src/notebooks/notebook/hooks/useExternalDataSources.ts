import { useCallback, useEffect } from 'react';
import { captureException } from '@sentry/react';
import type { ExternalDataSourcesContextValue } from '@decipad/interfaces';
import type { ExternalDataSourceCreateInput } from '@decipad/graphql-client';
import {
  useCreateExternalDataSourceMutation,
  useGetExternalDataSourcesQuery,
} from '@decipad/graphql-client';
import { isExpectableServerSideError } from '../../../utils/isExpectableServerSideError';
import { getDefined } from '@decipad/utils';

export const useExternalDataSources = (
  notebookId: string
): ExternalDataSourcesContextValue => {
  const [externalDataSources] = useGetExternalDataSourcesQuery({
    variables: { notebookId },
  });

  const [, createExternalDataSource] = useCreateExternalDataSourceMutation();

  useEffect(() => {
    if (externalDataSources.error) {
      if (!isExpectableServerSideError(externalDataSources.error)) {
        console.error(externalDataSources.error);
        captureException(externalDataSources.error);
      }
    }
  }, [externalDataSources.error]);

  return {
    externalDataSources: externalDataSources.data?.getExternalDataSources ?? [],
    createExternalDataSource: useCallback(
      async (dataSource) => {
        const results = await createExternalDataSource({
          dataSource: {
            ...dataSource,
            padId: notebookId,
          } as ExternalDataSourceCreateInput,
        });

        if (results.error) {
          console.error(results.error);
          captureException(results.error);
        }
        return getDefined(results.data?.createExternalDataSource);
      },
      [createExternalDataSource, notebookId]
    ),
  };
};
