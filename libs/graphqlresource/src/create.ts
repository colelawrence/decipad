import {
  GraphqlContext,
  ConcreteRecord,
  GraphqlObjectType,
} from '@decipad/backendtypes';
import { create as createPermission } from '@decipad/services/permissions';
import { requireUser } from './authorization';
import { Resource } from './';

export type CreateFunction<
  GraphqlT extends GraphqlObjectType,
  CreateInputType
> = (
  _: any,
  args: CreateInputType,
  context: GraphqlContext
) => Promise<GraphqlT>;

export function create<
  RecordT extends ConcreteRecord,
  GraphqlT extends GraphqlObjectType,
  CreateInputT,
  UpdateT
>(
  resourceType: Resource<RecordT, GraphqlT, CreateInputT, UpdateT>
): CreateFunction<GraphqlT, CreateInputT> {
  return async function (_: any, input: CreateInputT, context: GraphqlContext) {
    if (resourceType.beforeCreate) {
      await resourceType.beforeCreate(input, context);
    }
    const user = requireUser(context);
    const data = await resourceType.dataTable();
    const newRecord = resourceType.newRecordFrom(input);

    await data.create(newRecord);

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

    return resourceType.toGraphql(newRecord);
  };
}
