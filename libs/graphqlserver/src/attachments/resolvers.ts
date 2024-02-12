import { nanoid } from 'nanoid';
import { strictEqual as expectEqual } from 'assert';
import {
  attachmentUrl,
  getCreateAttachmentForm as getForm,
  getSize,
} from '@decipad/services/blobs/attachments';
import tables, { allPages, upsertStorageUsage } from '@decipad/tables';
import { timestamp } from '@decipad/backend-utils';
import { resource } from '@decipad/backend-resources';
import { ForbiddenError, UserInputError } from 'apollo-server-lambda';
import { requireUser } from '../authorization';
import parseResourceUri from '../utils/resource/parse-uri';
import { Attachment, Pad, Resolvers, User } from '@decipad/graphqlserver-types';
import { FileAttachmentRecord } from '@decipad/backendtypes';
import Boom from '@hapi/boom';

const ONE_HOUR_IN_SECONDS = 60 * 60;

const notebooks = resource('notebook');

export interface ICreateAttachmentFormParams {
  padId: string;
  fileName: string;
  fileType: string;
}

const resolvers: Resolvers = {
  Mutation: {
    async getCreateAttachmentForm(
      _,
      { padId, fileName: userFileName, fileType },
      context
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
    async attachFileToPad(_, { handle }, context) {
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

      const filesize = await getSize(attachment.filename);

      const newFileAttachment = {
        ...attachment,
        filesize,
      };
      await data.fileattachments.create(newFileAttachment);
      await data.futurefileattachments.delete({ id: handle });

      const pad = await data.pads.get({ id: parsedResource.id });
      const workspaceId = pad?.workspace_id;

      if (workspaceId == null) {
        throw Boom.forbidden(
          'Pad doesnt not have a workspace, cannot attach files'
        );
      }

      // hardcoding 'files' for now because I don't have a good
      // way of determining the correct file type.
      await upsertStorageUsage('files', workspaceId, filesize);

      return {
        id: newFileAttachment.id,
        fileName: newFileAttachment.user_filename,
        fileType: newFileAttachment.filetype,
        userId: newFileAttachment.user_id,
        padId: parsedResource.id,
        createdAt: newFileAttachment.createdAt,
        fileSize: newFileAttachment.filesize,
        url: newFileAttachment.resource_uri,
      };
    },

    async removeAttachmentFromPad(_, { attachmentId }, context) {
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

      return true;
    },
  },

  Pad: {
    async attachments(pad) {
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
          userId: fileAttachment.user_id,
          createdAt: fileAttachment.createdAt,
          url: fileAttachment.resource_uri,
          padId: pad.id,
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
    async uploadedBy(attachment) {
      const data = await tables();
      if (!attachment.userId) {
        return null;
      }

      return (await data.users.get({
        id: attachment.userId,
      })) as User;
    },

    url(attachment) {
      return attachmentUrl(attachment.padId, attachment.id);
    },

    async pad(attachment) {
      const data = await tables();
      return (await data.pads.get({
        id: attachment.padId,
      })) as Pad;
    },
  },
};

export default resolvers;
