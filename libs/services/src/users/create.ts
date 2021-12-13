import { UserInput, User, UserWithSecret } from '@decipad/backendtypes';
import { nanoid } from 'nanoid';
import tables from '../tables';
import { create as createWorkspace } from '../workspaces/create';
import { create as createPad } from '../pads/create';
import timestamp from '../common/timestamp';

export async function create(user: UserInput): Promise<UserWithSecret> {
  const data = await tables();

  const newUser = {
    id: nanoid(),
    name: user.name,
    last_login: timestamp(),
    image: user.image,
    email: user.email,
    secret: nanoid(),
  };

  await data.users.create(newUser);

  if (user.provider && user.providerId) {
    const newUserKey = {
      id: `${user.provider}:${user.providerId}`,
      user_id: newUser.id,
    };

    await data.userkeys.create(newUserKey);
  }

  if (user.email) {
    const newEmailUserKey = {
      id: `email:${user.email}`,
      user_id: newUser.id,
    };

    await data.userkeys.create(newEmailUserKey);
  }

  const firstName = userFirstName(newUser);
  const workspaceName = firstName ? `${firstName}'s Workspace` : 'My Workspace';
  const workspace = await createWorkspace(
    {
      name: workspaceName,
    },
    newUser
  );

  await createPad(
    workspace.id,
    {
      name: 'My first notebook',
    },
    newUser
  );

  await createWorkspace(
    {
      name: publicWorkspaceNameFor(newUser),
      isPublic: true,
    },
    newUser
  );

  return newUser;
}

export function userFirstName(user: User): string {
  return user.name.split(' ')[0];
}

export function publicWorkspaceNameFor(user: User) {
  const firstName = userFirstName(user);
  return firstName ? `${firstName}'s Public Workspace` : 'My Public Workspace';
}

export function privateWorkspaceNameFor(user: User) {
  const firstName = userFirstName(user);
  return firstName ? `${firstName}'s Workspace` : 'My Workspace';
}
