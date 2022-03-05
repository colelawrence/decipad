/* eslint-env jest */
// existing sequential test "story" very granular
/* eslint-disable jest/expect-expect */

import { testWithSandbox as test } from '@decipad/backend-test-sandbox';
import { Attachment, Pad, Workspace } from '@decipad/backendtypes';
import FormData from 'form-data';
import { createReadStream } from 'fs';
import { readFile } from 'fs/promises';
import { join } from 'path';
import waitForExpect from 'wait-for-expect';

test('attach files', (ctx) => {
  const { test: it } = ctx;
  let workspace: Workspace;
  let pad: Pad;
  let fileHandle: string | undefined;
  let attachment: Attachment | undefined;

  beforeAll(async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());
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

    expect(workspace).toMatchObject({ name: 'Workspace 1' });
  });

  beforeAll(async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());
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

    expect(pad).toMatchObject({
      name: 'Pad 1',
      workspace,
    });
  });

  it('an unauthenticated user cannot upload an attachment', async () => {
    await waitForExpect(async () => {
      const client = ctx.graphql.withoutAuth();

      await expect(
        client.query({
          query: ctx.gql`
            query {
              getCreateAttachmentForm(padId: "${pad.id}", fileName: "filename", fileType: "text/csv") {
                url
                fields {
                  key
                  value
                }
              }
            }
          `,
        })
      ).rejects.toThrow('Forbidden');
    });
  });

  it('other user cannot upload an attachment to another users pad', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth('test user id 2'));

    await expect(
      client.query({
        query: ctx.gql`
          query {
            getCreateAttachmentForm(padId: "${pad.id}", fileName: "filename", fileType: "text/csv") {
              url
              fields {
                key
                value
              }
            }
          }
        `,
      })
    ).rejects.toThrow('Forbidden');
  });

  it('authenticated user can upload an attachment', async () => {
    await new Promise((resolve, reject) => {
      (async () => {
        const client = ctx.graphql.withAuth(await ctx.auth());

        const formData = (
          await client.query({
            query: ctx.gql`
              query {
                getCreateAttachmentForm(padId: "${pad.id}", fileName: "filename", fileType: "text/csv") {
                  url
                  handle
                  fields {
                    key
                    value
                  }
                }
              }
            `,
          })
        ).data.getCreateAttachmentForm;

        fileHandle = formData.handle;
        expect(fileHandle).toBeDefined();

        const form = new FormData();
        for (const { key, value } of formData.fields) {
          form.append(key, value);
        }
        form.append(
          'file',
          createReadStream(join(__dirname, 'data', 'test1.csv'))
        );

        form.submit(formData.url, (err, res) => {
          if (err) {
            reject(err);
            return;
          }
          expect(res.statusCode).toBeGreaterThanOrEqual(200);
          expect(res.statusCode).toBeLessThan(300);
          res.once('end', resolve);
          res.resume();
        });
      })();
    });
  });

  it('same user can add attachment to pad', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());

    attachment = (
      await client.mutate({
        mutation: ctx.gql`
          mutation {
            attachFileToPad(handle: "${fileHandle}") {
              id
              fileName
              fileType
              fileSize
              url
              uploadedBy {
                id
              }
              pad {
                id
              }
            }
          }
        `,
      })
    ).data.attachFileToPad;

    expect(attachment).toMatchObject({
      fileName: 'filename',
      fileType: 'text/csv',
    });

    expect(attachment!.url).toBeDefined();
    expect(attachment!.fileSize).toBe(233);
    expect(attachment!.uploadedBy).toMatchObject({ id: 'test user id 1' });
    expect(attachment!.pad).toMatchObject({ id: pad.id });
  });

  it('other user cannot access attachment contents', async () => {
    const call = ctx.http.withAuth((await ctx.auth('test user id 2')).token);
    await expect(call(attachment!.url!)).rejects.toThrow('Forbidden');
  });

  it('same user can access attachment contents', async () => {
    const call = ctx.http.withAuth((await ctx.auth()).token);
    const result = await call(attachment!.url!);
    expect(result.headers.get('Content-Type')).toBe('text/csv');
    const fileContents = new Uint8Array(await result.arrayBuffer());
    const expectedFileContents = await readFile(
      join(__dirname, 'data', 'test1.csv')
    );
    expect(expectedFileContents.equals(fileContents)).toBe(true);
  });

  it('shares pad with other user', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());

    await client.mutate({
      mutation: ctx.gql`
        mutation {
          sharePadWithUser (
            id: "${pad.id}"
            userId: "test user id 2"
            permissionType: READ
            canComment: true)
        }
      `,
    });
  });

  it('other user can list attachment in pad', async () => {
    await waitForExpect(async () => {
      const client = ctx.graphql.withAuth(await ctx.auth('test user id 2'));
      const pad2: Pad = (
        await client.query({
          query: ctx.gql`
            query {
              getPadById(id: "${pad.id}") {
                id
                attachments {
                  id
                  fileName
                  fileType
                  fileSize
                  url
                  uploadedBy {
                    id
                  }
                  pad {
                    id
                  }
                }
              }
            }
          `,
        })
      ).data.getPadById;

      expect(pad2.attachments).toHaveLength(1);
      expect(pad2.attachments![0]).toMatchObject({
        id: attachment!.id,
        fileName: 'filename',
        fileType: 'text/csv',
        fileSize: 233,
        uploadedBy: {
          id: 'test user id 1',
        },
        pad: {
          id: pad.id,
        },
      });
    });
  });

  it('other user now has access to attachment', async () => {
    const call = ctx.http.withAuth((await ctx.auth('test user id 2')).token);
    const result = await call(attachment!.url!);
    expect(result.headers.get('Content-Type')).toBe('text/csv');
    const fileContents = new Uint8Array(await result.arrayBuffer());
    const expectedFileContents = await readFile(
      join(__dirname, 'data', 'test1.csv')
    );
    expect(expectedFileContents.equals(fileContents)).toBe(true);
  });

  it('other user cannot remove attachment', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth('test user id 2'));

    await expect(
      client.mutate({
        mutation: ctx.gql`
          mutation {
            removeAttachmentFromPad (attachmentId: "${attachment!.id}")
          }
        `,
      })
    ).rejects.toThrow('Forbidden');
  });

  it('owner user can remove attachment', async () => {
    const client = ctx.graphql.withAuth(await ctx.auth());

    await client.mutate({
      mutation: ctx.gql`
        mutation {
          removeAttachmentFromPad (attachmentId: "${attachment!.id}")
        }
      `,
    });
  });
});
