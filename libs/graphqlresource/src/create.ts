import { ConcreteRecord, GraphqlObjectType } from '@decipad/backendtypes';
import { create as createPermission } from '@decipad/services/permissions';
import { track } from '@decipad/backend-analytics';
import { requireUser } from './authorization';
import { Resource, ResourceResolvers } from './types';

export function create<
  RecordT extends ConcreteRecord,
  GraphqlT extends GraphqlObjectType,
  CreateInputT,
  UpdateT
>(
  resourceType: Resource<RecordT, GraphqlT, CreateInputT, UpdateT>
): ResourceResolvers<RecordT, GraphqlT, CreateInputT, UpdateT>['create'] {
  return async function create(_, input, context) {
    if (resourceType.beforeCreate) {
      await resourceType.beforeCreate(input, context);
    }
    const user = requireUser(context);
    const data = await resourceType.dataTable();
    const newRecord = resourceType.newRecordFrom(input);

    await data.create(newRecord);

    if (!resourceType.skipPermissions) {
      const permission: Parameters<typeof createPermission>[0] = {
        userId: user.id,
        givenByUserId: user.id,
        resourceType: resourceType.resourceTypeName,
        resourceId: newRecord.id,
        type: 'ADMIN',
        canComment: true,
      };
      if (resourceType.parentResourceUriFromCreateInput) {
        permission.parentResourceUri =
          resourceType.parentResourceUriFromCreateInput(input);
      }
      await createPermission(permission);
    }

    if (resourceType.humanName === 'notebook') {
      await track(
        context.event,
        {
          userId: user.id,
          event: 'Notebook Created',
          properties: {
            analytics_source: 'backend',
            notebook_id: newRecord.id,
          },
        },
        context
      );
    }
    return resourceType.toGraphql(newRecord);
  };
}
