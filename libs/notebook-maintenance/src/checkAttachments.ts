/* eslint-disable no-param-reassign */
import { getNotebookContent } from '@decipad/backend-notebook-content';
import type { FileAttachmentRecord } from '@decipad/backendtypes';
import {
  ELEMENT_IMAGE,
  type ImageElement,
  type TabElement,
} from '@decipad/editor-types';
import tables, { allPages, timestamp } from '@decipad/tables';
import { getDefined } from '@decipad/utils';
import { blobs, resourceusage } from '@decipad/services';

const ONE_MONTH = 30 * 24 * 60 * 60;

function getIdFromUrl(url: string): string {
  return getDefined(url.split('/').at(-1));
}

/**
 * Checks that every pad attachment corresponds to an existing image/csv/json
 * on the pad.
 *
 * This function tackles dangling storage, where the user deletes something
 * but for whatever reason we don't catch it on our graphql server.
 *
 */
export const checkAttachments = async (notebookId: string) => {
  const data = await tables();

  const pad = await data.pads.get({ id: notebookId });
  if (pad == null) {
    throw new Error(`Could not find pad with id ${notebookId}`);
  }

  if (pad.workspace_id == null) {
    throw new Error(`Pad with ID ${notebookId} does not have a workspace`);
  }

  const workspaceId = pad.workspace_id;

  const attachments = allPages(data.fileattachments, {
    IndexName: 'byResource',
    KeyConditionExpression: 'resource_uri = :resource_uri',
    ExpressionAttributeValues: {
      ':resource_uri': `/pads/${notebookId}`,
    },
  });

  //
  // First
  //
  // Let's find all the file attachments that have surpased their `deletionTimestamp`,
  // this means that it has been long enough, that we can actually delete them.
  //
  // We also delete them from the S3 Bucket
  //

  const currentTimestamp = timestamp();

  const padAttachments: Array<FileAttachmentRecord> = [];
  const toBeDeleted: Array<{
    id: string;
    filename: string;
  }> = [];

  for await (const attachment of attachments) {
    if (attachment == null) {
      continue;
    }

    if (
      attachment.toBeDeleted == null ||
      attachment.toBeDeleted > currentTimestamp
    ) {
      padAttachments.push(attachment);
    } else {
      toBeDeleted.push({
        id: attachment.id,
        filename: attachment.filename,
      });
    }
  }

  await data.fileattachments.batchDelete(
    toBeDeleted.map((i) => ({ id: i.id }))
  );

  await Promise.all(
    toBeDeleted.map((item) =>
      blobs.deleteBlob(
        blobs.attachmentFilePath(notebookId, item.filename, item.id)
      )
    )
  );

  //
  // Second
  //
  // Go though all the attachments of the pad and check.
  //
  // If there is an element related to this attachment
  // - Check if the attachment is marked for deletion, if so
  //   we want to unmark it (as we have now got the image back).
  // - Otherwise, if the element doesn't exist for this attachment
  //   we mark this attachment for deletion.
  //

  const content = await getNotebookContent(notebookId);

  const tabs = content.children as Array<TabElement>;
  const allElements = tabs.map((t) => t.children ?? []).flat();

  const attachableElements = allElements.filter(
    (e): e is ImageElement => e.type === ELEMENT_IMAGE
  );

  await Promise.all(
    padAttachments.map(async (attachment) => {
      const element = attachableElements.find(
        (i) => getIdFromUrl(i.url) === attachment.id
      );

      //
      // If we cannot find the element.
      // Then that means we have an attachment in the DB, but not
      // a corresponding attachment on the pad, so the user might have deleted it
      // when they were offline or something.
      //
      // So we must regain that storage by deleting this attachment
      //
      if (element != null) {
        if (attachment.toBeDeleted != null) {
          attachment.toBeDeleted = undefined;

          await resourceusage.storage.updateWorkspaceAndUser({
            workspaceId,
            padId: notebookId,
            userId: attachment.user_id,
            usage: {
              type: 'files',
              consumption: attachment.filesize,
            },
          });

          return data.fileattachments.put(attachment);
        }

        return;
      }

      if (attachment.toBeDeleted != null) {
        return;
      }

      attachment.toBeDeleted = timestamp() + ONE_MONTH;
      await resourceusage.storage.updateWorkspaceAndUser({
        workspaceId,
        padId: notebookId,
        userId: attachment.user_id,
        usage: {
          type: 'files',
          consumption: -attachment.filesize,
        },
      });

      return data.fileattachments.put(attachment);
    })
  );
};
