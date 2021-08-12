const arc = require('@architect/functions');
const { nanoid } = require('nanoid');

(async () => {
  await createUsers();
  await createWorkspaces();
  await createRoles();
  await assignUsersToRoles();
})();

async function createUsers() {
  const tables = await arc.tables();

  const newUser1 = {
    id: 'test user id 1',
    name: 'Test User',
    last_login: Date.now(),
    image: null,
    email: 'test1@decipad.com',
    secret: nanoid(),
  };

  await tables.users.put(newUser1);

  const newUserKey1 = {
    id: `email:${newUser1.email}`,
    user_id: newUser1.id,
  };

  await tables.userkeys.put(newUserKey1);

  const newUser2 = {
    id: 'test user id 2',
    name: 'Test User 2',
    last_login: Date.now(),
    image: null,
    email: 'test2@decipad.com',
    secret: nanoid(),
  };

  await tables.users.put(newUser2);

  const newUserKey2 = {
    id: `email:${newUser2.email}`,
    user_id: newUser2.id,
  };

  await tables.userkeys.put(newUserKey2);

  const newUser3 = {
    id: 'test user id 3',
    name: 'Test User 3',
    last_login: Date.now(),
    image: null,
    email: 'test3@decipad.com',
    secret: nanoid(),
  };

  await tables.users.put(newUser3);

  const newUserKey3 = {
    id: `email:${newUser3.email}`,
    user_id: newUser3.id,
  };

  await tables.userkeys.put(newUserKey3);
}

async function createWorkspaces() {
  const newWorkspace = {
    id: 'workspaceid1',
    name: 'Workspace 1',
  };

  const data = await arc.tables();
  await data.workspaces.put(newWorkspace);
}

async function createRoles() {
  const newRole = {
    id: 'roleid1',
    name: 'Role 1',
    workspace_id: 'workspaceid1',
  };

  const data = await arc.tables();
  await data.workspaces.put(newRole);
}

async function assignUsersToRoles() {
  const data = await arc.tables();
  const userId = 'test user id 2';
  const resource = '/roles/roleid1';
  const newPermission = {
    id: `/users/${userId}/roles/null${resource}`,
    resource_type: 'roles',
    resource_uri: resource,
    resource_id: 'roleid1',
    user_id: userId,
    role_id: 'null',
    given_by_user_id: userId,
    parent_resource_uri: `/workspaces/workspaceid1`,
    can_comment: false,
    type: 'READ',
  };
  await data.permissions.put(newPermission);

  await arc.queues.publish({
    name: `permissions-changes`,
    payload: {
      table: 'permissions',
      action: 'put',
      args: newPermission,
    },
  });
}
