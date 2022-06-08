import { UserInputError } from 'apollo-server-lambda';
import {
  ID,
  GraphqlContext,
  ConcreteRecord,
  GraphqlObjectType,
} from '@decipad/backendtypes';
import { expectAuthenticatedAndAuthorized } from './authorization';
import { Resource } from '.';

export type GetByIdFunction<GraphqlT extends GraphqlObjectType> = (
  _: unknown,
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
  return async (_: unknown, args, context: GraphqlContext) => {
    const { id } = args;
    const data = await resource.dataTable();
    const record = await data.get({ id });
    if (record == null) {
      throw new UserInputError(`No such ${resource.humanName}`);
    }
    console.log('record', record);
    if (!resource.isPublic || !resource.isPublic(record)) {
      await expectAuthenticatedAndAuthorized(
        `/${resource.resourceTypeName}/${id}`,
        context,
        'READ'
      );
    }

    return resource.toGraphql(record);
  };
}
