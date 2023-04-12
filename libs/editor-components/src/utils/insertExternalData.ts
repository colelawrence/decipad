import {
  createClient,
  CreateExternalDataSourceDocument,
  CreateExternalDataSourceMutation,
  CreateExternalDataSourceMutationVariables,
  ExternalProvider,
} from '@decipad/graphql-client';
import { getDefined } from '@decipad/utils';

type InsertExternalDataProps =
  CreateExternalDataSourceMutationVariables['dataSource'];

export type EasyExternalDataProps = {
  editorId: string;
  url: string;
  provider: ExternalProvider;
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
          provider: props.provider,
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
