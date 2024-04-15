import type { PadRecord } from '@decipad/backendtypes';
import { blobs, resourceusage } from '@decipad/services';
import tables, { allPages } from '@decipad/tables';

export async function deleteAttachments(padRecord: PadRecord): Promise<void> {
  const data = await tables();

  if (padRecord.workspace_id == null) {
    // eslint-disable-next-line no-console
    console.error('Pad does not belong to a workspace');
    return;
  }

  const attachments = allPages(data.fileattachments, {
    IndexName: 'byResource',
    KeyConditionExpression: 'resource_uri = :resource_uri',
    ExpressionAttributeValues: {
      ':resource_uri': `/pads/${padRecord.id}`,
    },
  });

  let storageUsed = 0;
  const attachmentIds: Array<{ id: string; filename: string }> = [];

  for await (const attachment of attachments) {
    if (attachment == null) {
      continue;
    }

    attachmentIds.push({ id: attachment.id, filename: attachment.filename });
    storageUsed += attachment.filesize;
  }

  await data.fileattachments.batchDelete(
    attachmentIds.map((i) => ({ id: i.id }))
  );

  await Promise.all(
    attachmentIds.map((item) =>
      blobs.deleteBlob(
        blobs.attachmentFilePath(padRecord.id, item.filename, item.id)
      )
    )
  );

  await resourceusage.storage.updateWorkspaceAndUser({
    workspaceId: padRecord.workspace_id,
    padId: padRecord.id,
    usage: { type: 'files', consumption: -storageUsed },
  });
}
