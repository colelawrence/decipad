import assert from 'assert';
import handle from '../../../queues/handler';
import { isAuthorized } from '../../../authorization';
import { notifyOne } from '../../../pubsub';
import tables from '../../../tables';
import allPages from '../../../tables/all-pages';

type ParsedPermission = {
  userId: ID;
  roleId: ID;
  resourceType: string;
  resourceId: ID;
};

export const handler = handle(permissionsChangesHandler);

async function permissionsChangesHandler(
  event: TableRecordChanges<PermissionRecord>
) {
  const { table, action, args } = event;

  assert.equal(table, 'permissions');
  const parsedPermission = parsePermissionId(args.id);
  const { userId, resourceType } = parsedPermission;
  if (action === 'put') {
    if (
      (args.resource_type === 'workspaces' || resourceType === 'workspaces') &&
      (args.user_id !== 'null' || userId !== 'null')
    ) {
      await handlePutWorkspaces(event);
    } else if (
      (args.resource_type === 'pads' || resourceType === 'pads') &&
      (args.user_id !== 'null' || userId !== 'null')
    ) {
      await handlePutPadsWithUser(event);
    }

    if (args.user_id === 'null' && args.role_id !== 'null') {
      await handlePutWithNoUser(args);
    }
    if (args.user_id !== 'null') {
      if (args.resource_type === 'roles') {
        await handlePutWithUserAndRoleResource(args);
      } else if (args.resource_type === 'pads' && args.role_id === 'null') {
        await handlePutWithUserAndPadResource(args);
      }
    }
  } else if (event.action === 'delete') {
    if (resourceType === 'pads' && userId !== 'null') {
      await handleDeletePadWithUser(parsedPermission);
    } else if (resourceType === 'workspaces' && userId !== 'null') {
      await handleDeleteWorkspaceWithUser(parsedPermission);
    }
    await handleDelete(args);
  }
}

async function handlePutWithUserAndRoleResource({
  resource_id: roleId,
  user_id,
}: PermissionRecord) {
  const data = await tables();

  let lastKey = null;
  do {
    const q: DynamoDbQuery = {
      IndexName: 'byUserAndRole',
      KeyConditionExpression: 'user_id = :user_id and role_id = :role_id',
      ExpressionAttributeValues: {
        ':role_id': roleId,
        ':user_id': 'null',
      },
    };

    if (lastKey) {
      q.ExclusiveStartKey = lastKey;
    }

    const rolePermissionsResult = await data.permissions.query(q);
    const rolePermissions = rolePermissionsResult.Items;
    lastKey = rolePermissionsResult.LastEvaluatedKey;

    for (const p of rolePermissions) {
      const permissionId = `/users/${user_id}/roles/${roleId}${p.resource_uri}`;
      const newPermission = {
        id: permissionId,
        resource_type: p.resource_type,
        resource_uri: p.resource_uri,
        resource_id: p.resource_id,
        user_id,
        given_by_user_id: p.given_by_user_id,
        type: p.type,
        role_id: roleId,
        parent_resource_uri: p.parent_resource_uri,
        parent_permission_id: p.id,
        can_comment: p.can_comment,
      };
      await data.permissions.put(newPermission);
    }
  } while (lastKey);
}

async function handlePutWithNoUser({ role_id }: PermissionRecord) {
  const data = await tables();
  const userIdsInRole = (
    await data.permissions.query({
      IndexName: 'byResource',
      KeyConditionExpression: 'resource_uri = :resource_uri',
      ExpressionAttributeValues: {
        ':resource_uri': `/roles/${role_id}`,
      },
    })
  ).Items.filter((p: PermissionRecord) => p.user_id !== 'null').map(
    (p: PermissionRecord) => p.user_id
  );

  let lastKey = null;
  do {
    const q: DynamoDbQuery = {
      IndexName: 'byUserAndRole',
      KeyConditionExpression: 'user_id = :user_id and role_id = :role_id',
      ExpressionAttributeValues: {
        ':role_id': role_id,
        ':user_id': 'null',
      },
    };

    if (lastKey) {
      q.ExclusiveStartKey = lastKey;
    }

    const rolePermissionsResult = await data.permissions.query(q);
    const rolePermissions = rolePermissionsResult.Items;
    lastKey = rolePermissionsResult.LastEvaluatedKey;

    for (const userId of userIdsInRole) {
      for (const p of rolePermissions) {
        const permissionId = `/users/${userId}/roles/${role_id}${p.resource_uri}`;
        const existingPermission = await data.permissions.get({
          id: permissionId,
        });
        if (!existingPermission) {
          const newPermission = {
            id: permissionId,
            resource_type: p.resource_type,
            resource_uri: p.resource_uri,
            resource_id: p.resource_id,
            user_id: userId,
            given_by_user_id: p.given_by_user_id,
            type: p.type,
            role_id,
            parent_resource_uri: p.parent_resource_uri,
            parent_permission_id: p.id,
            can_comment: p.can_comment,
          };
          await data.permissions.put(newPermission);
        }
      }
    }
  } while (lastKey);
}

async function handleDelete({ id }: TableRecordIdentifier) {
  const { userId, roleId } = parsePermissionId(id);
  if (userId !== 'null' || roleId === 'null') {
    return;
  }

  const data = await tables();

  const userIdsInRole = (
    await data.permissions.query({
      IndexName: 'byResource',
      KeyConditionExpression: 'resource_uri = :resource_uri',
      ExpressionAttributeValues: {
        ':resource_uri': `/roles/${roleId}`,
      },
    })
  ).Items.filter((p: PermissionRecord) => p.user_id !== 'null').map(
    (p: PermissionRecord) => p.user_id
  );

  const rolePermissions = (
    await data.permissions.query({
      IndexName: 'byParentPermission',
      KeyConditionExpression: 'parent_permission_id = :parent_permission_id',
      ExpressionAttributeValues: {
        ':parent_permission_id': id,
      },
    })
  ).Items;

  for (const userId of userIdsInRole) {
    for (const p of rolePermissions) {
      const permissionId = `/users/${userId}/roles/${roleId}${p.resource_uri}`;
      await data.permissions.delete({ id: permissionId });
    }
  }
}

async function handlePutWorkspaces(
  event: TableRecordChanges<PermissionRecord>
) {
  const { args } = event;
  const { userId, resourceId } = parsePermissionId(args.id);
  const user = { id: userId };

  const data = await tables();
  const workspace = await data.workspaces.get({ id: resourceId });
  await notifyOne(user, 'workspacesChanged', {
    added: [workspace],
  });
}

async function handleDeleteWorkspaceWithUser(perm: ParsedPermission) {
  const resource = `/${perm.resourceType}${
    perm.resourceId ? `/${perm.resourceId}` : ''
  }`;
  const user = { id: perm.userId };
  if (!(await isAuthorized(resource, user))) {
    await notifyOne(user, 'workspacesChanged', {
      removed: [perm.resourceId],
    });
  }
}

async function handlePutPadsWithUser(
  event: TableRecordChanges<PermissionRecord>
) {
  const { args: perm } = event;
  const resourceUri = `/${perm.resource_type}/${perm.resource_id}`;
  const user = { id: perm.user_id };

  const data = await tables();
  const pad = await data.pads.get({ id: perm.resource_id });
  if (!pad) {
    return;
  }
  await notifyOne(user, 'padsChanged', {
    added: [pad],
  });

  const query = {
    IndexName: 'byResource',
    KeyConditionExpression: 'resource_uri = :resource_uri',
    ExpressionAttributeValues: {
      ':resource_uri': resourceUri,
    },
  };

  for await (const tag of allPages(data.tags, query)) {
    const newUserTaggedResource = {
      id: `/workspaces/${pad.workspace_id}/users/${
        perm.user_id
      }/tags/${encodeURIComponent(tag.tag)}${perm.resource_uri}`,
      user_id: perm.user_id,
      tag: tag.tag,
      workspace_id: pad.workspace_id,
      resource_uri: perm.resource_uri,
    };

    await data.usertaggedresources.put(newUserTaggedResource);
  }
}

async function handleDeletePadWithUser(perm: ParsedPermission) {
  const resourceUri = `/${perm.resourceType}/${perm.resourceId}`;
  const user = { id: perm.userId };
  if (!(await isAuthorized(resourceUri, user))) {
    await notifyOne(user, 'padsChanged', {
      removed: [perm.resourceId],
    });

    const data = await tables();

    const query = {
      IndexName: 'byResourceAndUser',
      KeyConditionExpression:
        'resource_uri = :resource_uri and user_id = :user_id',
      ExpressionAttributeValues: {
        ':resource_uri': resourceUri,
        ':user_id': perm.userId,
      },
    };

    for await (const userTaggedResource of allPages(
      data.usertaggedresources,
      query
    )) {
      await data.usertaggedresources.delete({ id: userTaggedResource.id });
    }
  }
}

async function handlePutWithUserAndPadResource(perm: PermissionRecord) {
  assert.equal(perm.resource_type, 'pads');

  const data = await tables();

  const pad = await data.pads.get({ id: perm.resource_id });
  if (!pad) {
    return;
  }

  const query = {
    IndexName: 'byResource',
    KeyConditionExpression: 'resource_uri = :resource_uri',
    ExpressionAttributeValues: {
      ':resource_uri': perm.resource_uri,
    },
  };

  for await (const tag of allPages(data.tags, query)) {
    const newUserTaggedResource = {
      id: `/workspaces/${pad.workspace_id}/users/${
        perm.user_id
      }/tags/${encodeURIComponent(tag.tag)}${perm.resource_uri}`,
      user_id: perm.user_id,
      tag: tag.tag,
      workspace_id: pad.workspace_id,
      resource_uri: perm.resource_uri,
    };

    await data.usertaggedresources.put(newUserTaggedResource);
  }
}

function parsePermissionId(id: string): ParsedPermission {
  const parts = id.split('/');
  assert.equal(parts[1], 'users');
  assert.equal(parts[3], 'roles');
  return {
    userId: parts[2],
    roleId: parts[4],
    resourceType: parts[5],
    resourceId: parts.slice(6).join('/'),
  };
}
