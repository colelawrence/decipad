import {
  UserInput,
  User,
  UserWithSecret,
  WorkspaceRecord,
  PadRecord,
} from '@decipad/backendtypes';
import { nanoid } from 'nanoid';
import { initialWorkspace } from '@decipad/initial-workspace';
import tables from '@decipad/tables';
import { Element } from '@decipad/editor-types';
import { create as createWorkspace } from '../workspaces/create';
import { create as createPad } from '../pads/create';
import { create as createContent } from '../pad-content';
import timestamp from '../common/timestamp';

export interface UserCreationResult {
  user: UserWithSecret;
  workspaces: WorkspaceRecord[];
  notebooks: PadRecord[];
}

async function createInitialWorkspace(
  workspaceName: string,
  user: User
): Promise<Omit<UserCreationResult, 'user'>> {
  const workspace = await createWorkspace(
    {
      name: workspaceName,
    },
    user
  );

  const notebooks = await Promise.all(
    initialWorkspace.notebooks.map(async (notebook) => {
      const pad = await createPad(
        workspace.id,
        {
          name: notebook.title,
        },
        user
      );

      await createContent(pad.id, notebook.content.children as Element[]);
      return pad;
    })
  );

  return {
    workspaces: [workspace],
    notebooks,
  };
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

  const { workspaces, notebooks } = await createInitialWorkspace(
    workspaceName,
    newUser
  );
  await createWorkspace(
    {
      name: publicWorkspaceNameFor(newUser),
      isPublic: true,
    },
    newUser
  );

  return {
    user: newUser,
    workspaces,
    notebooks,
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
