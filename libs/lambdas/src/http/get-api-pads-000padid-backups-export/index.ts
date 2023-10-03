import Zip from 'adm-zip';
import { User } from '@decipad/backendtypes';
import { expectAuthenticated } from '@decipad/services/authentication';
import { getDefined } from '@decipad/utils';
import Boom from '@hapi/boom';
import tables, { allPages } from '@decipad/tables';
import {
  exportNotebookWithAttachments,
  snapshotFromDbSnapshot,
} from '@decipad/services/notebooks';
import { format } from 'date-fns';
import { resource } from '@decipad/backend-resources';
import { captureException } from '@decipad/backend-trace';
import handle from '../handle';

const notebooks = resource('notebook');

async function checkAccess(user: User | undefined, padId: string) {
  if (!user) {
    throw Boom.forbidden('Needs authentication');
  }

  await notebooks.expectAuthorized({
    user,
    recordId: padId,
    minimumPermissionType: 'READ',
  });
}

const DATE_FORMAT = 'yyyy-MM-dd_HHmm';

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
    try {
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
    } catch (err) {
      console.error('Error getting snapshot', err);
      captureException(err as Error);
    }
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
