import {
  ID,
  GraphqlContext,
  ConcreteRecord,
  GraphqlObjectType,
} from '@decipad/backendtypes';
import { notifyAllWithAccessTo } from '@decipad/services/pubsub';
import { track } from '@decipad/backend-analytics';
import { UserInputError } from 'apollo-server-lambda';
import { expectAuthenticatedAndAuthorized } from './authorization';
import { Resource } from '.';

export type UpdateArgs<T> = T & {
  id: ID;
};

interface MaybePublic {
  isPublic?: boolean;
}

export type UpdateFunction<
  GraphqlT extends GraphqlObjectType,
  UpdateInputType
> = (
  _: unknown,
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
  return async function update(
    _: unknown,
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

    await track(
      {
        userId: context.user?.id,
        event: `${resourceType.humanName} updated`,
      },
      context
    );

    if (
      (oldRecord as MaybePublic).isPublic &&
      !(updatedRecord as MaybePublic).isPublic
    ) {
      await track(
        {
          userId: context.user?.id,
          event: `${resourceType.humanName} made private`,
        },
        context
      );
    } else if (
      !(oldRecord as MaybePublic).isPublic &&
      (updatedRecord as MaybePublic).isPublic
    ) {
      await track(
        {
          userId: context.user?.id,
          event: `${resourceType.humanName} made public`,
        },
        context
      );
    }

    return graphqlReturn;
  };
}
