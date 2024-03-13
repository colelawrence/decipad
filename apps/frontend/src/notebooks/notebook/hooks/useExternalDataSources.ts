import { useCallback, useEffect } from 'react';
import { useToast } from '@decipad/toast';
import { captureException } from '@sentry/browser';
import { ExternalDataSourcesContextValue } from '@decipad/interfaces';
import {
  ExternalDataSourceCreateInput,
  useCreateExternalDataSourceMutation,
  useGetExternalDataSourcesQuery,
} from '@decipad/graphql-client';
import { isExpectableServerSideError } from '../../../utils/isExpectableServerSideError';
import { getDefined } from '@decipad/utils';

export const useExternalDataSources = (
  notebookId: string
): ExternalDataSourcesContextValue => {
  const toast = useToast();
  const [externalDataSources] = useGetExternalDataSourcesQuery({
    variables: { notebookId },
  });

  const [, createExternalDataSource] = useCreateExternalDataSourceMutation();

  useEffect(() => {
    if (externalDataSources.error) {
      toast(externalDataSources.error.message, 'error');
      if (!isExpectableServerSideError(externalDataSources.error)) {
        console.error(externalDataSources.error);
        captureException(externalDataSources.error);
      }
    }
  }, [externalDataSources.error, toast]);

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
