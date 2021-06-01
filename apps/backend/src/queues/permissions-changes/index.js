'use strict';
const assert = require('assert');
const handle = require('@architect/shared/queues/handler');
const { isAuthorized } = require('@architect/shared/authorization');
const pubsub = require('@architect/shared/pubsub');
const tables = require('@architect/shared/tables');

exports.handler = handle(permissionsChangesHandler);

async function permissionsChangesHandler(event) {
  const { table, action, args } = event;

  assert.equal(table, 'permissions');
  const { userId, resourceType } = parsePermissionId(args.id);
  if (
    (args.resource_type === 'workspaces' || resourceType === 'workspaces') &&
    args.user_id !== 'null' &&
    userId !== 'null'
  ) {
    await handleWorkspaces(event);
  } else if (
    (args.resource_type === 'pads' || resourceType === 'pads') &&
    args.user_id !== 'null' &&
    userId !== 'null'
  ) {
    await handlePads(event);
  }

  if (action === 'delete') {
    await handleDelete(args);
  } else if (action === 'put') {
    if (args.user_id === 'null' && args.role_id !== 'null') {
      await handlePutWithNoUser(args);
    } else if (args.resource_type === 'roles') {
      await handlePutWithUserAndRoleResource(args);
    }
  }
}

async function handlePutWithUserAndRoleResource({
  resource_id: roleId,
  user_id,
}) {
  const data = await tables();

  let lastKey = null;
  do {
    const q = {
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

async function handlePutWithNoUser({ role_id }) {
  const data = await tables();
  const userIdsInRole = (
    await data.permissions.query({
      IndexName: 'byResource',
      KeyConditionExpression: 'resource_uri = :resource_uri',
      ExpressionAttributeValues: {
        ':resource_uri': `/roles/${role_id}`,
      },
    })
  ).Items.filter((p) => p.user_id !== 'null').map((p) => p.user_id);

  let lastKey = null;
  do {
    const q = {
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

async function handleDelete({ id }) {
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
  ).Items.filter((p) => p.user_id !== 'null').map((p) => p.user_id);

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

async function handleWorkspaces(event) {
  const { action, args } = event;
  const { userId, resourceType, resourceId } = parsePermissionId(args.id);
  const user = { id: userId };

  if (action === 'delete') {
    // check if user is no longer authorized to access workspace
    const resource = `/${resourceType}${resourceId ? `/${resourceId}` : ''}`;
    if (!(await isAuthorized(resource, user))) {
      await pubsub.notifyOne(user, 'workspacesChanged', {
        removed: [resourceId],
      });
    }
  } else if (resourceId) {
    const data = await tables();
    const workspace = await data.workspaces.get({ id: resourceId });
    await pubsub.notifyOne(user, 'workspacesChanged', {
      added: [workspace],
    });
  }
}

async function handlePads(event) {
  const { action, args } = event;
  const { userId, resourceType, resourceId } = parsePermissionId(args.id);
  const user = { id: userId };

  if (action === 'delete') {
    // check if user is no longer authorized to access workspace
    const resource = `/${resourceType}${resourceId ? `/${resourceId}` : ''}`;
    if (!(await isAuthorized(resource, user))) {
      await pubsub.notifyOne(user, 'padsChanged', {
        removed: [resourceId],
      });
    }
  } else if (resourceId) {
    const data = await tables();
    const pad = await data.pads.get({ id: resourceId });
    await pubsub.notifyOne(user, 'padsChanged', {
      added: [pad],
    });
  }
}

function parsePermissionId(id) {
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
