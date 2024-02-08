import { Page } from '@playwright/test';
import stringify from 'json-stringify-safe';

export const createWorkspace = async (
  p: Page,
  workspaceName?: string
): Promise<string> => {
  const resp = await p.request.post('/graphql', {
    data: stringify({
      query:
        'mutation CreateWorkspace($name: String!) {\n' +
        '  createWorkspace(workspace: {name: $name}) {\n' +
        '    id\n' +
        '  }\n' +
        '}',
      variables: {
        name: workspaceName ?? 'Test Workspace',
      },
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const jsonResp = await resp.json();

  if (jsonResp.errors?.length) {
    throw new Error(jsonResp.errors[0].message);
  }
  return jsonResp.data.createWorkspace.id;
};

export const getWorkspaces = async (p: Page): Promise<{ name: string }[]> => {
  const resp = await (
    await p.request.post('/graphql', {
      data: stringify({
        query:
          'query GetWorkspaces {\n' +
          '  workspaces {\n' +
          '    name\n' +
          '  }\n' +
          '}',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
  ).json();
  if (resp.errors?.length) {
    throw new Error(resp.errors[0].message);
  }
  return resp.data.workspaces;
};
