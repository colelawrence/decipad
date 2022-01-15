import {
  UserInput,
  User,
  UserWithSecret,
  WorkspaceRecord,
  PadRecord,
} from '@decipad/backendtypes';
import { nanoid } from 'nanoid';
import tables from '../tables';
import { create as createWorkspace } from '../workspaces/create';
import { create as createPad } from '../pads/create';
import timestamp from '../common/timestamp';

export interface UserCreationResult {
  user: UserWithSecret;
  workspaces: WorkspaceRecord[];
  notebooks: PadRecord[];
}

export async function create(user: UserInput): Promise<UserCreationResult> {
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

  const introPad = await createPad(
    workspace.id,
    {
      name: 'My first notebook',
    },
    newUser
  );

  return {
    user: newUser,
    workspaces: [workspace],
    notebooks: [introPad],
  };
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
