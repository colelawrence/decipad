import { testWithSandbox as test } from '@decipad/backend-test-sandbox';
import type { PadRecord, WorkspaceRecord } from '@decipad/backendtypes';
import { create } from '../../../libs/services/src/workspaces/create';
import { create as createNotebook } from '../../../libs/services/src/notebooks/create';
import { StorageTracker } from '../../../libs/services/src/resource-usage/storage';
import { save } from '../../../libs/services/src/blobs/save';
import { attachmentFilePath } from '../../../libs/services/src/blobs/attachments';
import {
  getKey,
  getResourceUsageRecords,
} from '../../../libs/services/src/resource-usage/common';
import { checkAttachments } from '../../../libs/notebook-maintenance/src/checkAttachments';
import { getDefined } from '@decipad/utils';
import tables from '@decipad/tables';
import * as Y from 'yjs';
import { applySlateOps } from '@decipad/slate-yjs';
import type {
  ImageElement,
  TabElement,
  TitleElement,
} from '@decipad/editor-types';
import { ensureGraphqlResponseIsErrorFree } from './utils/ensureGraphqlResponseIsErrorFree';

jest.retryTimes(0);

const storage = new StorageTracker();

test('Storage Usage', (ctx) => {
  let workspace: WorkspaceRecord;
  let pad: PadRecord;

  const doc = new Y.Doc();
  const sharedType = doc.getArray();

  beforeAll(async () => {
    const user = await ctx.auth();

    workspace = await create({ name: 'Workspace 1' }, getDefined(user.user));

    expect(workspace).toMatchObject({ name: 'Workspace 1' });

    pad = await createNotebook(workspace.id, { name: 'Test notebook' });
    expect(pad).toMatchObject({ name: 'Test notebook' });

    const data = await tables();

    applySlateOps(
      sharedType as any,
      [
        {
          type: 'insert_node',
          path: [0],
          node: {
            id: '1',
            type: 'title',
            children: [{ text: 'title' }],
          } satisfies TitleElement,
        },
        {
          type: 'insert_node',
          path: [1],
          node: {
            id: '2',
            type: 'tab',
            name: 'my_tab',
            children: [],
          } satisfies TabElement,
        },
      ],
      'origin'
    );

    const updateBuffer = Y.encodeStateAsUpdate(doc);

    await data.docsyncupdates.put({
      id: `/pads/${pad.id}`,
      seq: 'abcabc',
      data: Buffer.from(updateBuffer).toString('base64'),
    });
  });

  it('returns 0 with on usage', async () => {
    await expect(storage.getUsage(workspace.id)).resolves.toBe(0);
  });

  it('returns correct storage when pad has been attached to', async () => {
    const data = await tables();

    await data.fileattachments.create({
      filesize: 1000,
      user_id: 'user_id',
      resource_uri: `/pads/${pad.id}`,
      user_filename: 'my_file',
      filename: 'my_file',
      filetype: 'csv',
      id: 'first-attachment',
    });

    await storage.updateWorkspaceAndUser({
      workspaceId: workspace.id,
      padId: pad.id,
      usage: { type: 'files', consumption: 1000 },
    });

    await save(
      attachmentFilePath(pad.id, 'my_file', 'first-attachment'),
      Buffer.from('hello world', 'utf8'),
      'plain/txt'
    );

    await expect(storage.getUsage(workspace.id)).resolves.toBe(
      1000 / 1_000_000
    );

    const records = await getResourceUsageRecords(
      getKey('storage/files/null/pads', pad.id),
      getKey('storage/files/null/workspaces', workspace.id)
    );

    expect(records).toEqual(
      expect.arrayContaining([
        {
          consumption: 1000,
          createdAt: expect.any(Number),
          id: `storage/files/null/pads/${pad.id}`,
        },
        {
          consumption: 1000,
          createdAt: expect.any(Number),
          id: `storage/files/null/workspaces/${workspace.id}`,
        },
      ])
    );
  });

  it('removes storage using notebook maintenance (file attachment is not attached to notebook content)', async () => {
    await checkAttachments(pad.id);

    const data = await tables();

    await expect(
      data.fileattachments.get({ id: 'first-attachment' })
    ).resolves.toMatchObject({
      toBeDeleted: expect.any(Number),
    });

    await expect(storage.getUsage(workspace.id)).resolves.toBe(0);

    const records = await getResourceUsageRecords(
      getKey('storage/files/null/pads', pad.id),
      getKey('storage/files/null/workspaces', workspace.id)
    );

    expect(records).toEqual(
      expect.arrayContaining([
        {
          consumption: 0,
          createdAt: expect.any(Number),
          id: `storage/files/null/pads/${pad.id}`,
        },
        {
          consumption: 0,
          createdAt: expect.any(Number),
          id: `storage/files/null/workspaces/${workspace.id}`,
        },
      ])
    );
  });

  it('doesnt remove storage if file attachment is attached to content', async () => {
    const data = await tables();

    await data.fileattachments.create({
      filesize: 5000,
      user_id: 'user_id',
      resource_uri: `/pads/${pad.id}`,
      user_filename: 'my_image',
      filename: 'my_image',
      filetype: 'image/png',
      id: 'second-attachment',
    });

    await storage.updateWorkspaceAndUser({
      workspaceId: workspace.id,
      padId: pad.id,
      usage: { type: 'files', consumption: 5000 },
    });

    await save(
      attachmentFilePath(pad.id, 'my_image', 'second-attachment'),
      Buffer.from('this is an image', 'utf8'),
      'image/png'
    );

    applySlateOps(
      sharedType as any,
      [
        {
          type: 'insert_node',
          path: [1, 0],
          node: {
            type: 'img',
            url: 'http://localhost:3000/pad/123123/attachment/second-attachment',
            id: '3',
            children: [{ text: '' }],
          } satisfies ImageElement,
        },
      ],
      'origin'
    );

    const updateBuffer = Y.encodeStateAsUpdate(doc);

    await data.docsyncupdates.put({
      id: `/pads/${pad.id}`,
      seq: 'abcabc',
      data: Buffer.from(updateBuffer).toString('base64'),
    });

    await expect(storage.getUsage(workspace.id)).resolves.toBe(
      5000 / 1_000_000
    );

    await checkAttachments(pad.id);

    await expect(storage.getUsage(workspace.id)).resolves.toBe(
      5000 / 1_000_000
    );

    const records = await getResourceUsageRecords(
      getKey('storage/files/null/pads', pad.id),
      getKey('storage/files/null/workspaces', workspace.id)
    );

    expect(records).toEqual(
      expect.arrayContaining([
        {
          consumption: 5000,
          createdAt: expect.any(Number),
          id: `storage/files/null/pads/${pad.id}`,
        },
        {
          consumption: 5000,
          createdAt: expect.any(Number),
          id: `storage/files/null/workspaces/${workspace.id}`,
        },
      ])
    );
  });

  it('clears the deletion mark from attachments that have references in the document', async () => {
    const data = await tables();

    const attachment = (await data.fileattachments.get({
      id: 'second-attachment',
    }))!;
    attachment.toBeDeleted = 5000;

    await checkAttachments(pad.id);

    const attachmentAgain = await data.fileattachments.get({
      id: 'second-attachment',
    });

    expect(attachmentAgain).toMatchObject({
      id: 'second-attachment',
    });

    expect(attachmentAgain!.toBeDeleted).toBeUndefined();
  });

  it('cleans up `fileattachments` when deletionTimestamp is reached', async () => {
    const data = await tables();

    const attachment = await data.fileattachments.get({
      id: 'first-attachment',
    });

    attachment!.toBeDeleted = 1000;

    await data.fileattachments.put(attachment!);

    await checkAttachments(pad.id);

    const firstAttachment = await data.fileattachments.get({
      id: 'first-attachment',
    });
    expect(firstAttachment).toBeUndefined();
  });

  it('removes all attachments if the pad is deleted', async () => {
    const data = await tables();

    await expect(storage.getUsage(workspace.id)).resolves.toEqual(
      5000 / 1_000_000
    );

    const client = ctx.graphql.withAuth(await ctx.auth());
    await ensureGraphqlResponseIsErrorFree(
      client.mutate({
        mutation: ctx.gql`
          mutation {
            removePad(
              id: "${pad.id}"
            )
          }
        `,
      })
    );

    await expect(storage.getUsage(workspace.id)).resolves.toEqual(0);

    const attachment = await data.fileattachments.get({
      id: 'third-attachment',
    });
    expect(attachment).toBeUndefined();
  });
});
