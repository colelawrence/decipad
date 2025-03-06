import { ConcreteRecord, GraphqlObjectType } from '@decipad/backendtypes';
import { notifyAllWithAccessTo } from '@decipad/services/pubsub';
import { track } from '@decipad/backend-analytics';
import { UserInputError } from 'apollo-server-lambda';
import { expectAuthenticatedAndAuthorized } from './authorization';
import { getResources } from './utils/getResources';
import { Resource, ResourceResolvers } from './types';

interface MaybePublic {
  isPublic?: boolean;
}

export function update<
  RecordT extends ConcreteRecord,
  GraphqlT extends GraphqlObjectType,
  CreateInputT,
  UpdateInputT
>(
  resourceType: Resource<RecordT, GraphqlT, CreateInputT, UpdateInputT>
): ResourceResolvers<RecordT, GraphqlT, CreateInputT, UpdateInputT>['update'] {
  return async function update(_, input, context) {
    const resources = await getResources(resourceType, input.id);
    if (!resourceType.skipPermissions) {
      await expectAuthenticatedAndAuthorized(resources, context, 'WRITE');
    }
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
      await notifyAllWithAccessTo(resources, resourceType.pubSubChangeTopic, {
        updated: [graphqlReturn],
      });
    }

    track(context.event, {
      userId: context.user?.id,
      event: `${resourceType.humanName} updated`,
    });

    if (
      (oldRecord as MaybePublic).isPublic &&
      !(updatedRecord as MaybePublic).isPublic
    ) {
      track(context.event, {
        userId: context.user?.id,
        event: `${resourceType.humanName} made private`,
      });
    } else if (
      !(oldRecord as MaybePublic).isPublic &&
      (updatedRecord as MaybePublic).isPublic
    ) {
      track(context.event, {
        userId: context.user?.id,
        event: `${resourceType.humanName} made public`,
      });
    }

    return graphqlReturn;
  };
}
