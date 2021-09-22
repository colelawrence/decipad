import { UserInputError } from 'apollo-server-lambda';
import {
  ID,
  GraphqlContext,
  ConcreteRecord,
  GraphqlObjectType,
} from '@decipad/backendtypes';
import { notifyAllWithAccessTo } from '@decipad/services/pubsub';
import { expectAuthenticatedAndAuthorized } from './authorization';
import { Resource } from './';

export type UpdateArgs<T> = T & {
  id: ID;
};

export type UpdateFunction<
  GraphqlT extends GraphqlObjectType,
  UpdateInputType
> = (
  _: any,
  args: UpdateArgs<UpdateInputType>,
  context: GraphqlContext
) => Promise<GraphqlT>;

export function update<
  RecordT extends ConcreteRecord,
  GraphqlT extends GraphqlObjectType,
  CreateInputT,
  UpdateInputT
>(
  resourceType: Resource<RecordT, GraphqlT, CreateInputT, UpdateInputT>
): UpdateFunction<GraphqlT, UpdateInputT> {
  return async function (
    _: any,
    input: UpdateArgs<UpdateInputT>,
    context: GraphqlContext
  ) {
    const resource = `/${resourceType.resourceTypeName}/${input.id}`;
    await expectAuthenticatedAndAuthorized(resource, context, 'WRITE');
    const data = await resourceType.dataTable();
    const oldRecord = await data.get({ id: input.id });
    if (!oldRecord) {
      throw new UserInputError(`No such ${resourceType.resourceTypeName}`);
    }

    const updatedRecord = resourceType.updateRecordFrom(oldRecord, input);
    await data.put(updatedRecord);
    const graphqlReturn = resourceType.toGraphql(updatedRecord);

    if (resourceType.pubSubChangeTopic) {
      console.log('notifying', resourceType.pubSubChangeTopic);
      await notifyAllWithAccessTo(resource, resourceType.pubSubChangeTopic, {
        updated: [graphqlReturn],
      });
    }

    return graphqlReturn;
  };
}
