import {
  GraphqlContext,
  Pad,
  User,
  Attachment,
  FileAttachmentRecord,
} from '@decipad/backendtypes';
import { nanoid } from 'nanoid';
import { strictEqual as expectEqual } from 'assert';
import {
  attachmentUrl,
  getCreateAttachmentForm as getForm,
  getSize,
} from '@decipad/services/blobs/attachments';
import tables, { allPages } from '@decipad/tables';
import { timestamp } from '@decipad/backend-utils';
import { resource } from '@decipad/backend-resources';
import { ForbiddenError, UserInputError } from 'apollo-server-lambda';
import { requireUser } from '../authorization';
import parseResourceUri from '../utils/resource/parse-uri';

const ONE_HOUR_IN_SECONDS = 60 * 60;

const notebooks = resource('notebook');

export interface ICreateAttachmentFormParams {
  padId: string;
  fileName: string;
  fileType: string;
}

export default {
  Mutation: {
    async getCreateAttachmentForm(
      _: unknown,
      { padId, fileName: userFileName, fileType }: ICreateAttachmentFormParams,
      context: GraphqlContext
    ) {
      const { user, resources } = await notebooks.expectAuthorizedForGraphql({
        context,
        minimumPermissionType: 'WRITE',
        recordId: padId,
      });
      if (!user) {
        throw new ForbiddenError('Not authenticated');
      }

      const form = await getForm(padId, userFileName, fileType);

      const data = await tables();
      const newFileAttachment = {
        id: nanoid(),
        user_id: user.id,
        resource_uri: resources[0],
        user_filename: userFileName,
        filename: form.fileName,
        filetype: form.fileType,
        expires_at: timestamp() + ONE_HOUR_IN_SECONDS,
      };
      await data.futurefileattachments.create(newFileAttachment);

      return {
        url: form.url,
        handle: newFileAttachment.id,
        fields: Object.entries(form.fields).map(([key, value]) => ({
          key,
          value,
        })),
      };
    },
    async attachFileToPad(
      _: unknown,
      { handle }: { handle: string },
      context: GraphqlContext
    ): Promise<Attachment> {
      const user = requireUser(context);

      const data = await tables();
      const attachment = await data.futurefileattachments.get({ id: handle });
      if (!attachment) {
        throw new UserInputError('No such attachment was found');
      }

      if (attachment.user_id !== user.id) {
        throw new ForbiddenError('File was not uploaded by the same user');
      }

      await notebooks.expectAuthorizedForGraphql({
        context,
        resourceIds: [attachment.resource_uri],
        minimumPermissionType: 'WRITE',
      });

      const parsedResource = parseResourceUri(attachment.resource_uri);
      expectEqual(parsedResource.type, 'pads');

      const newFileAttachment = {
        ...attachment,
        filesize: await getSize(attachment.filename),
      };
      await data.fileattachments.create(newFileAttachment);
      await data.futurefileattachments.delete({ id: handle });

      return {
        id: newFileAttachment.id,
        fileName: newFileAttachment.user_filename,
        fileType: newFileAttachment.filetype,
        uploadedByUserId: newFileAttachment.user_id,
        padId: parsedResource.id,
        createdAt: newFileAttachment.createdAt,
        fileSize: newFileAttachment.filesize,
      };
    },

    async removeAttachmentFromPad(
      _: unknown,
      { attachmentId }: { attachmentId: string },
      context: GraphqlContext
    ) {
      const data = await tables();
      const attachment = await data.fileattachments.get({ id: attachmentId });
      if (!attachment) {
        throw new UserInputError('No such attachment was found');
      }

      await notebooks.expectAuthorizedForGraphql({
        context,
        resourceIds: [attachment.resource_uri],
        minimumPermissionType: 'WRITE',
      });

      await data.fileattachments.delete({ id: attachmentId });
    },
  },

  Pad: {
    async attachments(pad: Pad): Promise<Attachment[]> {
      const query = {
        IndexName: 'byResource',
        KeyConditionExpression: 'resource_uri = :resource_uri',
        ExpressionAttributeValues: {
          ':resource_uri': `/pads/${pad.id}`,
        },
      };

      const data = await tables();

      const attachments: Attachment[] = [];
      for await (const attachment of allPages<FileAttachmentRecord, Attachment>(
        data.fileattachments,
        query,
        (fileAttachment) => ({
          id: fileAttachment.id,
          fileName: fileAttachment.user_filename,
          fileType: fileAttachment.filetype,
          fileSize: fileAttachment.filesize,
          uploadedByUserId: fileAttachment.user_id,
          createdAt: fileAttachment.createdAt,
          padId: parseResourceUri(fileAttachment.resource_uri).id,
        })
      )) {
        if (attachment) {
          attachments.push(attachment);
        }
      }

      return attachments;
    },
  },

  Attachment: {
    async uploadedBy(attachment: Attachment): Promise<User | undefined> {
      const data = await tables();
      return data.users.get({ id: attachment.uploadedByUserId });
    },

    url(attachment: Attachment): string {
      return attachmentUrl(attachment.padId, attachment.id);
    },

    async pad(attachment: Attachment): Promise<Pad | undefined> {
      const data = await tables();
      return data.pads.get({ id: attachment.padId });
    },
  },
};
