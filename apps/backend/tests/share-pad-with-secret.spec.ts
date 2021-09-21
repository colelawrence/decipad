/* eslint-disable jest/expect-expect */
/* eslint-env jest */
import { Workspace, Pad } from '@decipad/backendtypes';
import {
  testWithSandbox as test,
  TestContext,
} from '@decipad/backend-test-sandbox';
import { encode } from './utils/resource';

test('share pad with secret', (ctx: TestContext) => {
  const { test: it } = ctx;
  let workspace: Workspace;
  let pad: Pad;
  // TODO type auth result
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let authRes: any;
  let secret: string;

  beforeAll(async () => {
    authRes = await ctx.auth();
    const client = ctx.graphql.withAuth(authRes);
    workspace = (
      await client.mutate({
        mutation: ctx.gql`
          mutation {
            createWorkspace(workspace: { name: "Workspace 1" }) {
              id
              name
            }
          }
        `,
      })
    ).data.createWorkspace;

    pad = (
      await client.mutate({
        mutation: ctx.gql`
          mutation {
            createPad(
              workspaceId: "${workspace.id}"
              pad: { name: "Pad 1" }
            ) {
              id
              name
              workspace {
                id
                name
              }
            }
          }
        `,
      })
    ).data.createPad;
  });

  it('pad owner should be able to share with secret', async () => {
    const client = ctx.graphql.withAuth(authRes);
    const {
      data: { sharePadWithSecret },
    } = await client.mutate({
      mutation: ctx.gql`
        mutation {
          sharePadWithSecret(id: "${pad.id}", permissionType: READ, canComment: false)
        }
      `,
    });

    expect(sharePadWithSecret).toBeDefined();
    expect(typeof sharePadWithSecret).toBe('string');
    secret = sharePadWithSecret;
  });

  it('pad owner can save some content', async () => {
    const call = ctx.http.withAuth(authRes.token);
    await call(`/api/syncdoc/${encode(`/pads/${pad.id}/content`)}`, {
      method: 'PUT',
      body: '["~#iL",[["~#iM",["ops",["^0",[["^1",["action","makeList","obj","982602ad-8ccc-406a-bd96-39df0b1a71c5"]],["^1",["action","ins","obj","982602ad-8ccc-406a-bd96-39df0b1a71c5","key","_head","elem",1]],["^1",["action","makeMap","obj","73fce065-0465-4547-8270-dcd75cb37bfb"]],["^1",["action","set","obj","73fce065-0465-4547-8270-dcd75cb37bfb","key","type","value","p"]],["^1",["action","makeList","obj","0055603a-6e3f-4e1d-87cb-9c9aec848906"]],["^1",["action","ins","obj","0055603a-6e3f-4e1d-87cb-9c9aec848906","key","_head","elem",1]],["^1",["action","makeMap","obj","1758ff95-f7ca-484c-a2fa-401397b65d8d"]],["^1",["action","makeText","obj","5778df97-5560-4410-a7c3-ba364d339ac9"]],["^1",["action","link","obj","1758ff95-f7ca-484c-a2fa-401397b65d8d","key","text","value","5778df97-5560-4410-a7c3-ba364d339ac9"]],["^1",["action","link","obj","0055603a-6e3f-4e1d-87cb-9c9aec848906","key","starter:1","value","1758ff95-f7ca-484c-a2fa-401397b65d8d"]],["^1",["action","link","obj","73fce065-0465-4547-8270-dcd75cb37bfb","key","children","value","0055603a-6e3f-4e1d-87cb-9c9aec848906"]],["^1",["action","set","obj","73fce065-0465-4547-8270-dcd75cb37bfb","key","id","value","000000000000000000000"]],["^1",["action","link","obj","982602ad-8ccc-406a-bd96-39df0b1a71c5","key","starter:1","value","73fce065-0465-4547-8270-dcd75cb37bfb"]],["^1",["action","link","obj","00000000-0000-0000-0000-000000000000","key","value","value","982602ad-8ccc-406a-bd96-39df0b1a71c5"]]]],"actor","starter","seq",1,"deps",["^1",[]],"message","Initialization","undoable",false]],["^1",["ops",["^0",[["^1",["action","ins","obj","982602ad-8ccc-406a-bd96-39df0b1a71c5","key","_head","elem",2]],["^1",["action","makeMap","obj","02fb4454-eb71-4a75-bba9-30dc53a46e80"]],["^1",["action","set","obj","02fb4454-eb71-4a75-bba9-30dc53a46e80","key","id","value","6d1c2bbb-e354-4e73-83d4-77494a43327e"]],["^1",["action","set","obj","02fb4454-eb71-4a75-bba9-30dc53a46e80","key","type","value","h1"]],["^1",["action","makeList","obj","bb05d081-f12a-4e79-9ebd-c157aeeddcf9"]],["^1",["action","ins","obj","bb05d081-f12a-4e79-9ebd-c157aeeddcf9","key","_head","elem",1]],["^1",["action","makeMap","obj","58694202-a4b9-4229-84bd-a0e95c0d316e"]],["^1",["action","makeText","obj","81c12647-718a-4f11-b39d-03efd0afa216"]],["^1",["action","link","obj","58694202-a4b9-4229-84bd-a0e95c0d316e","key","text","value","81c12647-718a-4f11-b39d-03efd0afa216"]],["^1",["action","link","obj","bb05d081-f12a-4e79-9ebd-c157aeeddcf9","key","53b71681-5b69-4921-b61c-f9fb34983dc0:1","value","58694202-a4b9-4229-84bd-a0e95c0d316e"]],["^1",["action","link","obj","02fb4454-eb71-4a75-bba9-30dc53a46e80","key","children","value","bb05d081-f12a-4e79-9ebd-c157aeeddcf9"]],["^1",["action","link","obj","982602ad-8ccc-406a-bd96-39df0b1a71c5","key","53b71681-5b69-4921-b61c-f9fb34983dc0:2","value","02fb4454-eb71-4a75-bba9-30dc53a46e80"]]]],"actor","53b71681-5b69-4921-b61c-f9fb34983dc0","seq",1,"deps",["^1",["starter",1]]]]]]',
      headers: {
        'Content-Type': 'text/json',
      },
    });
  });

  it('secret can be sent and used by other user to read pad', async () => {
    const { call } = ctx.http;
    const response = await call(
      `/api/doc/${encode(`/pads/${pad.id}/content`)}/${secret}`
    );
    expect(response.ok).toBe(true);
    expect(await response.json()).toMatchInlineSnapshot(`
Object {
  "value": Array [
    Object {
      "children": Array [
        Object {
          "text": "",
        },
      ],
      "id": "6d1c2bbb-e354-4e73-83d4-77494a43327e",
      "type": "h1",
    },
    Object {
      "children": Array [
        Object {
          "text": "",
        },
      ],
      "id": "000000000000000000000",
      "type": "p",
    },
  ],
}
`);
  });
});
