import { Page } from 'playwright-core';

export const importNotebook = async (
  workspaceId: string,
  source: string,
  p = page as Page
): Promise<string> => {
  const resp = await (
    await p.request.post('/graphql', {
      data: JSON.stringify({
        query:
          'mutation ImportNotebook($workspaceId: ID!, $source: String!) {\n' +
          '  importPad(workspaceId: $workspaceId, source: $source) {\n' +
          '    id\n' +
          '  }\n' +
          '}\n',
        operationName: 'ImportNotebook',
        variables: { workspaceId, source },
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
  ).json();
  if (resp.errors?.length) {
    throw new Error(resp.errors[0].message);
  }
  return resp.data.importPad.id;
};
