import { Page } from 'playwright-core';

export const createWorkspace = async (p: Page): Promise<string> => {
  const resp = await (
    await p.request.post('/graphql', {
      data: JSON.stringify({
        query:
          'mutation CreateWorkspace($name: String!) {\n' +
          '  createWorkspace(workspace: {name: $name}) {\n' +
          '    id\n' +
          '  }\n' +
          '}',
        variables: {
          name: 'Test Workspace',
        },
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
  ).json();
  if (resp.errors?.length) {
    throw new Error(resp.errors[0].message);
  }
  return resp.data.createWorkspace.id;
};
