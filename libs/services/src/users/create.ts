import { track } from '@decipad/backend-analytics';
import {
  PadRecord,
  SectionRecord,
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
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { forbidden, notAcceptable } from '@hapi/boom';
import timestamp from '../common/timestamp';
import { create as createPad } from '../notebooks';
import { create as createContent } from '../pad-content';
import { create as createWorkspace } from '../workspaces/create';
import { isAllowedToLogIn } from './isAllowed';

export interface UserCreationResult {
  user: UserWithSecret;
  workspaces: WorkspaceRecord[];
  notebooks: PadRecord[];
  sections: SectionRecord[];
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

  const initialWorkspaceSpec = initialWorkspace();

  const notebooks = [];
  /* eslint-disable no-await-in-loop */
  for (const notebook of initialWorkspaceSpec.notebooks) {
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

  const data = await tables();

  const sections = [];
  /* eslint-disable no-await-in-loop */
  for (const section of initialWorkspaceSpec.sections) {
    const newSection = {
      ...section,
      id: nanoid(),
      workspace_id: workspace.id,
      createdAt: timestamp(),
    };
    await data.sections.put(newSection);
    sections.push(newSection);
  }

  return {
    workspaces: [workspace],
    notebooks,
    sections,
  };
}

export async function create(
  user: UserInput,
  event: APIGatewayProxyEventV2
): Promise<UserCreationResult> {
  const data = await tables();
  const email = user.email?.toLowerCase();

  if (!user.email) {
    throw notAcceptable('Need user email');
  }

  if (!isAllowedToLogIn(user.email)) {
    throw forbidden();
  }

  const newUser = {
    email,
    id: nanoid(),
    name: user.name,
    last_login: timestamp(),
    image: user.image,
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

  if (email) {
    const newEmailUserKey = {
      id: `email:${email}`,
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

  await track(event, {
    event: 'user created',
    userId: newUser.id,
    properties: { email, firstName },
  });

  return {
    user: newUser,
    workspaces,
    notebooks,
    sections: [],
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
