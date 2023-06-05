import {
  createClient,
  CreateExternalDataSourceDocument,
  CreateExternalDataSourceMutation,
  CreateExternalDataSourceMutationVariables,
  ExternalProvider,
} from '@decipad/graphql-client';
import { getDefined } from '@decipad/utils';
import { Computer } from '@decipad/computer';
import { tryImport } from '@decipad/import';
import { ImportElementSource } from '@decipad/editor-types';

type InsertExternalDataProps =
  CreateExternalDataSourceMutationVariables['dataSource'];

export type EasyExternalDataProps = {
  editorId: string;
  url: string;
  provider: ImportElementSource;
};

/**
 * Inserts the database entry needed to query databases.
 * It takes 2 different parameter types
 * @see EasyExternalDataProps and InsertExternalDataProps
 *
 * EasyExternalDataProps allows you to send the editorId, url and provider,
 * and we handle the string formatting for you.
 */
export const insertExternalData = async (
  props: InsertExternalDataProps | EasyExternalDataProps
) => {
  const client = createClient();

  const internalProps: InsertExternalDataProps =
    'editorId' in props
      ? {
          name: `data-source/${props.editorId}/${props.provider}/${props.url}`,
          padId: props.editorId,
          externalId: props.url,
          provider: props.provider as ExternalProvider,
        }
      : props;

  const result = await client
    .mutation<
      CreateExternalDataSourceMutation,
      CreateExternalDataSourceMutationVariables
    >(CreateExternalDataSourceDocument, {
      dataSource: internalProps,
    })
    .toPromise();
  if (result.error) {
    throw result.error;
  }
  return getDefined(
    result.data?.createExternalDataSource,
    'expected response data'
  );
};

type States = {
  connectionState: { type: 'success' | 'error'; message: string } | undefined;
  queryState: { type: 'success' | 'error'; message: string } | undefined;
};

export type DbOptions = {
  connectionString: string;

  // Credential connection
  host: string;
  username: string;
  password: string;
  database: string;
  port: string;

  existingConn: {
    name: string;
    id: string;
  };

  dbConnType?: 'url' | 'credentials' | 'existing-conn';

  query: string;
};

/**
 * Attempts to connect to backend by inserting external data,
 * and then importing it. Returns the ID of the external data,
 * or undefined if it was unsuccessful.
 */
export async function attemptConnection(
  props: EasyExternalDataProps,
  computer: Computer
): Promise<string | undefined> {
  const newExternalData = await insertExternalData(props);
  if (newExternalData.dataUrl == null) return undefined;

  // We simply need to check if we can import or not.
  try {
    await tryImport({
      computer,
      url: new URL(newExternalData.dataUrl ?? ''),
    });
    return newExternalData.dataUrl;
  } catch (error) {
    // Do nothing
  }
  return undefined;
}

/**
 * Queries the backend for the external data, to check if query is valid.
 * Returns an error State @see States.
 */
export async function fetchQuery(
  url: string,
  query: string
): Promise<States['queryState']> {
  const queryRes = await fetch(url, {
    body: query,
    method: 'POST',
  });

  if (!queryRes.ok) {
    const err = await errorFromFetchResult(queryRes);
    return {
      type: 'error',
      message: err ?? 'There was an error with your query',
    };
  }

  return {
    type: 'success',
    message: 'Query executed successfully',
  };
}

// Helper function to extract error message from result.
export async function errorFromFetchResult(
  resp: Response
): Promise<string | undefined> {
  const respText = await resp.text();
  try {
    const respJson = JSON.parse(respText);
    if ('message' in respJson) {
      return respJson.message;
    }
  } catch (err) {
    // Do nothing
  }
  return undefined;
}
