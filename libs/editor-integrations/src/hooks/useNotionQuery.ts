import {
  GetNotionDocument,
  GetNotionQuery,
  GetNotionQueryVariables,
} from '@decipad/graphql-client';
import { useCallback } from 'react';
import { useClient } from 'urql';

export function useNotionQuery(notebookId: string, notionDatabaseUrl: string) {
  const client = useClient();

  const execute = useCallback(() => {
    return client.query<GetNotionQuery, GetNotionQueryVariables>(
      GetNotionDocument,
      {
        notebookId,
        url: notionDatabaseUrl,
      }
    );
  }, [notebookId, notionDatabaseUrl, client]);

  return execute;
}
