import {
  createClient,
  CreateExternalDataSourceDocument,
  CreateExternalDataSourceMutation,
  CreateExternalDataSourceMutationVariables,
} from '@decipad/graphql-client';
import { getDefined } from '@decipad/utils';

type InsertExternalDataProps =
  CreateExternalDataSourceMutationVariables['dataSource'];

export const insertExternalData = async (props: InsertExternalDataProps) => {
  const client = createClient();
  const result = await client
    .mutation<
      CreateExternalDataSourceMutation,
      CreateExternalDataSourceMutationVariables
    >(CreateExternalDataSourceDocument, {
      dataSource: props,
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
