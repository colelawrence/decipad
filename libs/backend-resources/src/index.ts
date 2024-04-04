import type { ConcreteRecord } from '@decipad/backendtypes';
import { expectAuthorized } from '@decipad/services/authorization';
import { getDefined } from '@decipad/utils';
import Boom from '@hapi/boom';
import { ForbiddenError } from 'apollo-server-lambda';
import { isAuthorizedGraphql } from './graphql';
import * as resources from './resources';
import type { BackendResource, BackendResourceDef } from './types';

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
        if (!parentResourceId) {
          throw err;
        }
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
      const resId = getDefined(def.parentResourceUriFromRecord)(rec);
      if (resId) {
        resourceIds.push(resId);
      }
      return resourceIds;
    },

    async expectAuthorizedForGraphql({
      context,
      recordId,
      resourceIds: _resourceIds = [],
      minimumPermissionType,
      ignorePadPublic,
    }) {
      const resourceIds = [..._resourceIds];
      if (recordId) {
        resourceIds.push(resourceId(recordId));
      }
      if (def.parentResourceUriFromRecord && recordId) {
        const rec = await load(recordId);
        const resId = await def.parentResourceUriFromRecord(rec);
        if (resId) {
          resourceIds.push(resId);
        }
      }
      const { user, permissionType } = await isAuthorizedGraphql(
        resourceIds,
        context,
        minimumPermissionType,
        ignorePadPublic
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
