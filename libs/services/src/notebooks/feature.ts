import { badRequest, notFound } from '@hapi/boom';
import { tables, timestamp } from '@decipad/tables';
import { getNotebookInitialState } from '@decipad/backend-notebook-content';
import { nanoid } from 'nanoid';
import * as Y from 'yjs';
import { toSlateDoc } from '@decipad/slate-yjs';
import md5 from 'md5';
import { canonicalize } from 'json-canonicalize';
import type { DynamoDbQuery } from '@decipad/backendtypes';

// ss = snapshot
const FEATURED_SS_NAME = 'Featured 1';

function getHash(content: Uint8Array): string {
  const doc = new Y.Doc();
  Y.applyUpdate(doc, content);

  const value = toSlateDoc(doc.getArray());
  const version = md5(canonicalize(value));

  return version;
}

export async function featureNotebook(notebookId: string): Promise<void> {
  const data = await tables();
  const notebook = await data.pads.get({ id: notebookId });
  if (!notebook) {
    throw notFound('notebook not found');
  }

  if (!notebook.userConsentToFeatureOnGallery) {
    throw badRequest('notebook is not publicly highlighted');
  }

  const notebookContent = await getNotebookInitialState(
    notebookId,
    FEATURED_SS_NAME
  );

  if (notebookContent.length === 0) {
    throw notFound('This notebook is not published');
  }

  await data.docsyncsnapshots.put({
    id: nanoid(),
    docsync_id: notebookId,
    snapshotName: FEATURED_SS_NAME,
    updatedAt: timestamp(),
    createdAt: timestamp(),
    version: getHash(notebookContent),
  });
}

export async function removeFeaturedNotebook(
  notebookId: string
): Promise<void> {
  const data = await tables();
  const notebook = await data.pads.get({ id: notebookId });
  if (!notebook) {
    throw notFound('notebook not found');
  }

  const query: DynamoDbQuery = {
    IndexName: 'byDocsyncIdAndSnapshotName',
    KeyConditionExpression:
      'snapshotName = :snapshotName AND docsync_id = :docsync_id',
    ExpressionAttributeValues: {
      ':snapshotName': FEATURED_SS_NAME,
      ':docsync_id': notebookId,
    },
  };

  const ss = (await data.docsyncsnapshots.query(query)).Items;
  if (ss.length === 0) {
    throw notFound('notebook does not have featured snapshot');
  }

  const { id } = ss[0];

  await data.docsyncsnapshots.delete({ id });
}
