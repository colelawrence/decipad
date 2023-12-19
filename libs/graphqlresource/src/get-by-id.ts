import { ConcreteRecord, GraphqlObjectType } from '@decipad/backendtypes';
import { UserInputError } from 'apollo-server-lambda';
import { expectAuthenticatedAndAuthorized } from './authorization';
import { getResources } from './utils/getResources';
import { Resource, ResourceResolvers } from './types';

export function getById<
  RecordT extends ConcreteRecord,
  GraphqlT extends GraphqlObjectType,
  CreateT,
  UpdateT
>(
  resource: Resource<RecordT, GraphqlT, CreateT, UpdateT>
): ResourceResolvers<RecordT, GraphqlT, CreateT, UpdateT>['getById'] {
  return async (_, args, context) => {
    const { id } = args;
    const data = await resource.dataTable();
    const record = await data.get({ id });
    if (record == null) {
      throw new UserInputError(`No such ${resource.humanName}`);
    }
    if (
      !resource.skipPermissions &&
      (!resource.isPublic || !resource.isPublic(record))
    ) {
      const resources = await getResources(resource, id);
      await expectAuthenticatedAndAuthorized(resources, context, 'READ');
    }

    return resource.toGraphql(record);
  };
}
