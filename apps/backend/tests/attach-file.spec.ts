/* eslint-env jest */

// existing sequential test "story" very granular
/* eslint-disable jest/expect-expect */

import FormData from 'form-data';
import { createReadStream } from 'fs';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { Workspace, Pad, Attachment } from '@decipad/backendtypes';
import test from './sandbox';
import { timeout } from './utils/timeout';

test('attach files', ({
  test: it,
  graphql: { withAuth, withoutAuth },
  gql,
  http: { call },
  auth,
}) => {
  let workspace: Workspace;
  let pad: Pad;
  let fileHandle: string | undefined;
  let attachment: Attachment | undefined;

  beforeAll(async () => {
    const client = withAuth(await auth());
    workspace = (
      await client.mutate({
        mutation: gql`
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
    const client = withAuth(await auth());
    pad = (
      await client.mutate({
        mutation: gql`
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

    await timeout(2000);
  });

  it('an unauthenticated user cannot upload an attachment', async () => {
    const client = withoutAuth();

    await expect(
      client.query({
        query: gql`
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

  it('other user cannot upload an attachment to another users pad', async () => {
    const client = withAuth(await auth('test user id 2'));

    await expect(
      client.query({
        query: gql`
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
        const client = withAuth(await auth());

        const formData = (
          await client.query({
            query: gql`
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
    const client = withAuth(await auth());

    attachment = (
      await client.mutate({
        mutation: gql`
          mutation {
            attachFileToPad(handle: "${fileHandle}") {
              id
              fileName
              fileType
              fileSize
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

    expect(attachment!.fileSize).toBe(233);
    expect(attachment!.uploadedBy).toMatchObject({ id: 'test user id 1' });
    expect(attachment!.pad).toMatchObject({ id: pad.id });
  });

  it('other user cannot access attachment contents', async () => {
    const client = withAuth(await auth('test user id 2'));
    await expect(
      client.query({
        query: gql`
          query {
            getAttachmentURL(attachmentId: "${attachment!.id}")
          }
        `,
      })
    ).rejects.toThrow('Forbidden');
  });

  it('same user can access attachment contents', async () => {
    const client = withAuth(await auth());
    const url = (
      await client.query({
        query: gql`
          query {
            getAttachmentURL(attachmentId: "${attachment!.id}")
          }
        `,
      })
    ).data.getAttachmentURL;
    expect(typeof url).toBe('string');

    const result = await call(url);
    expect(result.headers.get('Content-Type')).toBe('text/csv');
    const fileContents = new Uint8Array(await result.arrayBuffer());
    const expectedFileContents = await readFile(
      join(__dirname, 'data', 'test1.csv')
    );
    expect(expectedFileContents.equals(fileContents)).toBe(true);
  });

  it('shares pad with other user', async () => {
    const client = withAuth(await auth());

    await client.mutate({
      mutation: gql`
        mutation {
          sharePadWithUser (
            padId: "${pad.id}"
            userId: "test user id 2"
            permissionType: READ
            canComment: true)
        }
      `,
    });
  });

  it('waits a bit', () => timeout(3000));

  it('other user can list attachment in pad', async () => {
    const client = withAuth(await auth('test user id 2'));
    const pad2: Pad = (
      await client.query({
        query: gql`
          query {
            getPadById(id: "${pad.id}") {
              id
              attachments {
                id
                fileName
                fileType
                fileSize
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

  it('other user now has access to attachment', async () => {
    const client = withAuth(await auth('test user id 2'));
    const url = (
      await client.query({
        query: gql`
          query {
            getAttachmentURL(attachmentId: "${attachment!.id}")
          }
        `,
      })
    ).data.getAttachmentURL;
    expect(typeof url).toBe('string');

    const result = await call(url);
    expect(result.headers.get('Content-Type')).toBe('text/csv');
    const fileContents = new Uint8Array(await result.arrayBuffer());
    const expectedFileContents = await readFile(
      join(__dirname, 'data', 'test1.csv')
    );
    expect(expectedFileContents.equals(fileContents)).toBe(true);
  });

  it('other user cannot remove attachment', async () => {
    const client = withAuth(await auth('test user id 2'));

    await expect(
      client.mutate({
        mutation: gql`
          mutation {
            removeAttachmentFromPad (attachmentId: "${attachment!.id}")
          }
        `,
      })
    ).rejects.toThrow('Forbidden');
  });

  it('owner user can remove attachment', async () => {
    const client = withAuth(await auth());

    await client.mutate({
      mutation: gql`
        mutation {
          removeAttachmentFromPad (attachmentId: "${attachment!.id}")
        }
      `,
    });
  });

  it('other user can no longer list attachment in pad', async () => {
    const client = withAuth(await auth('test user id 2'));
    const pad2: Pad = (
      await client.query({
        query: gql`
          query {
            getPadById(id: "${pad.id}") {
              id
              attachments {
                id
                fileName
                fileType
                fileSize
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

    expect(pad2.attachments).toHaveLength(0);
  });
});
