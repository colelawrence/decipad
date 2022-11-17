import { track } from '@decipad/backend-analytics';
import {
  PadRecord,
  User,
  UserInput,
  UserWithSecret,
  WorkspaceRecord,
} from '@decipad/backendtypes';
import { MyElement } from '@decipad/editor-types';
import { initialWorkspace } from '@decipad/initial-workspace';
import tables from '@decipad/tables';
import { timeout } from '@decipad/utils';
import { nanoid } from 'nanoid';
import timestamp from '../common/timestamp';
import { create as createPad } from '../notebooks';
import { create as createContent } from '../pad-content';
import { create as createWorkspace } from '../workspaces/create';

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

  const notebooks = [];
  /* eslint-disable no-await-in-loop */
  for (const notebook of initialWorkspace.notebooks) {
    const pad = await createPad(
      workspace.id,
      {
        name: notebook.title,
        icon: notebook.icon,
        status: notebook.status,
      },
      user
    );
    await createContent(pad.id, notebook.content.children as MyElement[]);
    notebooks.push(pad);

    // Giving it some time so the notebooks won't end up with the same timestamp and therefore
    // random order in the frontend.
    await timeout(1000);
  }
  /* eslint-enable no-await-in-loop */

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

  await track({
    event: 'user created',
    userId: newUser.id,
    properties: { email: user.email, firstName },
  });

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
