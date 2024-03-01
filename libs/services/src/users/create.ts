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
import { nanoid } from 'nanoid';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import timestamp from '../common/timestamp';
import { create as createPad } from '../notebooks';
import { create as createContent } from '../pad-content';
import { create as createWorkspace } from '../workspaces/create';
import { getDefined } from '@decipad/utils';
import { justCreateUser } from './justCreateUser';

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

  const notebooks: Array<PadRecord> = [];
  /* eslint-disable no-await-in-loop */

  const createdAt = Math.floor(new Date().getTime()) / 1000; // for database

  await Promise.all(
    initialWorkspaceSpec.notebooks.map(async (notebook, i) => {
      const pad = await createPad(
        workspace.id,
        {
          name: notebook.title,
          icon: notebook.icon,
          status: notebook.status,
        },
        user,
        undefined,
        createdAt + i
      );
      await createContent(pad.id, notebook.content.children as MyElement[]);
      notebooks.push(pad);
    })
  );

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

  const newUser = await justCreateUser(user);
  const email = getDefined(newUser.email);

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
