import { UserInputError } from 'apollo-server-lambda';
import {
  ID,
  GraphqlContext,
  ConcreteRecord,
  GraphqlObjectType,
} from '@decipad/backendtypes';
import { check } from './authorization';
import { Resource } from './';

export type GetByIdFunction<GraphqlT extends GraphqlObjectType> = (
  _: any,
  { id }: { id: ID },
  context: GraphqlContext
) => Promise<GraphqlT>;

export function getById<
  RecordT extends ConcreteRecord,
  GraphqlT extends GraphqlObjectType,
  CreateT,
  UpdateT
>(
  resource: Resource<RecordT, GraphqlT, CreateT, UpdateT>
): GetByIdFunction<GraphqlT> {
  return async function (_: any, { id }: { id: ID }, context: GraphqlContext) {
    await check(`/${resource.resourceTypeName}/${id}`, context, 'READ');
    const data = await resource.dataTable();
    const record = await data.get({ id });
    if (record == undefined) {
      throw new UserInputError(`No such ${resource.resourceTypeName}`);
    }

    return resource.toGraphql(record);
  };
}
