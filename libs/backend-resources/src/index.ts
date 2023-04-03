import { ConcreteRecord } from '@decipad/backendtypes';
import { expectAuthorized } from '@decipad/services/authorization';
import { getDefined } from '@decipad/utils';
import Boom from '@hapi/boom';
import { ForbiddenError } from 'apollo-server-lambda';
import { isAuthorizedGraphql } from './graphql';
import * as resources from './resources';
import { BackendResource, BackendResourceDef } from './types';

export const resource = <TData extends ConcreteRecord>(
  name: keyof typeof resources
): BackendResource => {
  const def = resources[name] as unknown as BackendResourceDef<TData>;

  const resourceId = (recordId: string) => `/${def.name}/${recordId}`;

  const load = async (recordId: string): Promise<TData> => {
    const data = await def.dataTable();
    const rec = await data.get({ id: recordId });
    if (!rec) {
      throw Boom.notFound(`Could not find ${def.name} with id ${recordId}`);
    }
    return rec as TData;
  };

  return {
    async expectAuthorized({ user, recordId, minimumPermissionType }) {
      let rec: TData;

      const resourceIds = [resourceId(recordId)];
      if (minimumPermissionType === 'READ' && def.isPublic) {
        rec = await load(recordId);
        if (def.isPublic(rec)) {
          return {
            permissionType: minimumPermissionType,
            resources: resourceIds,
          };
        }
      }
      try {
        return {
          permissionType: await expectAuthorized({
            user,
            resources: resourceIds,
            minimumPermissionType,
          }),
          resources: resourceIds,
          user,
        };
      } catch (err) {
        if (!def.delegateAccessToParentResource) {
          throw err;
        }
        rec ??= await load(recordId);
        const parentResourceId = getDefined(def.parentResourceUriFromRecord)(
          rec
        );
        return {
          permissionType: await expectAuthorized({
            user,
            resource: parentResourceId,
            minimumPermissionType,
          }),
          resources: [...resourceIds, parentResourceId],
          user,
        };
      }
    },

    async getResourceIds(recordId) {
      const resourceIds = [resourceId(recordId)];
      if (!def.delegateAccessToParentResource) {
        return resourceIds;
      }
      const rec = await load(recordId);
      resourceIds.push(getDefined(def.parentResourceUriFromRecord)(rec));
      return resourceIds;
    },

    async expectAuthorizedForGraphql({
      context,
      recordId,
      resourceIds: _resourceIds = [],
      minimumPermissionType,
    }) {
      const resourceIds = [..._resourceIds];
      if (recordId) {
        resourceIds.push(resourceId(recordId));
      }
      if (def.parentResourceUriFromRecord && recordId) {
        const rec = await load(recordId);
        resourceIds.push(await def.parentResourceUriFromRecord(rec));
      }
      const { user, permissionType } = await isAuthorizedGraphql(
        resourceIds,
        context,
        minimumPermissionType
      );
      if (!permissionType) {
        throw new ForbiddenError('Forbidden');
      }
      return {
        user,
        permissionType,
        resources: resourceIds,
      };
    },
  };
};
