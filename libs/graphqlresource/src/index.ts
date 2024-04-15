import type { ConcreteRecord, GraphqlObjectType } from '@decipad/backendtypes';
import type { Resource, ResourceResolvers } from './types';
import { identity } from '@decipad/utils';
import { access } from './access';
import { create } from './create';
import { getById } from './get-by-id';
import { myPermissionType } from './my-permission-type';
import { remove } from './remove';
import { shareWithEmail } from './share-with-email';
import { shareWithRole } from './share-with-role';
import { shareWithSecret } from './share-with-secret';
import { shareWithUser } from './share-with-user';
import { unshareWithRole } from './unshare-with-role';
import { unshareWithSecret } from './unshare-with-secret';
import { unshareWithUser } from './unshare-with-user';
import { update } from './update';

export { maximumPermissionType } from './maximumPermissionType';

export default function createGraphqlResource<
  DataTableT extends ConcreteRecord,
  GraphqlT extends GraphqlObjectType,
  CreateInputT,
  UpdateInputT
>(
  resourceType: Resource<DataTableT, GraphqlT, CreateInputT, UpdateInputT>
): ResourceResolvers<DataTableT, GraphqlT, CreateInputT, UpdateInputT> {
  const shareWithUserFn = shareWithUser(resourceType);
  return {
    getById: getById(resourceType),
    create: create(resourceType),
    update: update(resourceType),
    remove: remove(resourceType),
    shareWithUser: shareWithUserFn,
    unshareWithUser: unshareWithUser(resourceType),
    shareWithRole: shareWithRole(resourceType),
    unshareWithRole: unshareWithRole(resourceType),
    shareWithEmail: shareWithEmail(resourceType)(shareWithUserFn),
    shareWithSecret: shareWithSecret(resourceType),
    access: access(resourceType),
    myPermissionType: myPermissionType(resourceType),
    unshareWithSecret: unshareWithSecret(resourceType),
    toGraphql: resourceType.toGraphql ?? identity,
  };
}
