import { Doc as YDoc, applyUpdate } from 'yjs';
import Zip from 'adm-zip';
import { DocSyncSnapshotRecord, User } from '@decipad/backendtypes';
import { expectAuthenticated } from '@decipad/services/authentication';
import { expectAuthorized } from '@decipad/services/authorization';
import { getDefined } from '@decipad/utils';
import Boom from '@hapi/boom';
import tables, { allPages } from '@decipad/tables';
import {
  exportNotebookWithAttachments,
  fetchSnapshotFromFile,
} from '@decipad/services/notebooks';
import { Buffer } from 'buffer';
import { toSlateDoc } from '@decipad/slate-yjs';
import { Document } from '@decipad/editor-types';
import { format } from 'date-fns';
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

const DATE_FORMAT = 'yyyy-MM-dd_HHmm';

interface Snapshot {
  name: string;
  doc: Document;
  date?: Date;
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
    doc: { children: toSlateDoc(doc.getArray()) },
    date:
      (snapshot.createdAt && new Date(snapshot.createdAt * 1000)) || undefined,
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
    const { title, content } = await exportNotebookWithAttachments({
      notebookId,
      doc: s.doc,
    });
    zip.addFile(
      `${s.date && `${format(s.date, DATE_FORMAT)}_`}${title}.zip`,
      content
    );
  }
  return zip.toBuffer().toString('base64');
};

export const handler = handle(async (event) => {
  const padId = getDefined(getDefined(event.pathParameters).padid);

  const [{ user }] = await expectAuthenticated(event);
  await checkAccess(user, padId);

  const zip = await exportPadBackups(padId);
  return {
    statusCode: 200,
    headers: {
      'content-type': 'application/zip',
    },
    body: zip,
    isBase64Encoded: true,
  };
});
