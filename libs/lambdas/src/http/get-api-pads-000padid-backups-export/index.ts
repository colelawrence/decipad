import { Doc as YDoc, applyUpdate } from 'yjs';
import Zip from 'adm-zip';
import { DocSyncSnapshotRecord, User } from '@decipad/backendtypes';
import { expectAuthenticated } from '@decipad/services/authentication';
import { expectAuthorized } from '@decipad/services/authorization';
import { getDefined } from '@decipad/utils';
import Boom from '@hapi/boom';
import tables, { allPages } from '@decipad/tables';
import { fetchSnapshotFromFile } from '@decipad/services/notebooks';
import { Buffer } from 'buffer';
import { toSlateDoc } from '@decipad/slate-yjs';
import handle from '../handle';

async function checkAccess(
  user: User | undefined,
  padId: string
): Promise<void> {
  if (!user) {
    throw Boom.forbidden('Needs authentication');
  }

  const resource = `/pads/${padId}`;
  await expectAuthorized({ resource, user, permissionType: 'READ' });
}

const serialize = (_: string, value: unknown): unknown =>
  typeof value === 'bigint' ? value.toString() : value;

interface Snapshot {
  name: string;
  data: Buffer;
}

const snapshotFromDbSnapshot = async (
  snapshot: DocSyncSnapshotRecord
): Promise<Snapshot | undefined> => {
  const data =
    (snapshot.data && Buffer.from(snapshot.data, 'base64')) ||
    (await fetchSnapshotFromFile(getDefined(snapshot.data_file_path)));

  if (!data) {
    return undefined;
  }
  const doc = new YDoc();
  applyUpdate(doc, data);

  return {
    name: snapshot.snapshotName,
    data: Buffer.from(
      JSON.stringify({ children: toSlateDoc(doc.getArray()) }, serialize, '\t'),
      'utf-8'
    ),
  };
};

const exportPadBackups = async (notebookId: string): Promise<string> => {
  const data = await tables();
  const zip = new Zip();
  for await (const snapshot of allPages(data.docsyncsnapshots, {
    IndexName: 'byDocsyncId',
    KeyConditionExpression: 'docsync_id = :docsync_id',
    ExpressionAttributeValues: {
      ':docsync_id': notebookId,
    },
  })) {
    const s = snapshot && (await snapshotFromDbSnapshot(snapshot));
    if (!s) {
      continue;
    }
    zip.addFile(`${s.name}.json`, s.data);
  }
  return zip.toBuffer().toString('base64');
};

export const handler = handle(async (event) => {
  const padId = getDefined(getDefined(event.pathParameters).padid);

  const [{ user }] = await expectAuthenticated(event);
  await checkAccess(user, padId);

  const response = await exportPadBackups(padId);
  return {
    statusCode: 200,
    headers: {
      'content-type': 'application/zip',
    },
    body: response,
    isBase64Encoded: true,
  };
});
