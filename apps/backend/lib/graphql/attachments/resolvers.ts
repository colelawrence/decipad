import { nanoid } from 'nanoid';
import { UserInputError, ForbiddenError } from 'apollo-server-lambda';
import { equal as expectEqual } from 'assert';
import { requireUser, check } from '../authorization';
import {
  getCreateAttachmentForm as getForm,
  getSize,
  getURL,
} from '../../s3/attachments';
import tables from '../../tables';
import allPages from '../../tables/all-pages';
import parseResourceUri from '../../utils/parse-resource-uri';

export interface ICreateAttachmentFormParams {
  padId: string;
  fileName: string;
  fileType: string;
}

export default {
  Query: {
    async getCreateAttachmentForm(
      _: any,
      { padId, fileName: userFileName, fileType }: ICreateAttachmentFormParams,
      context: GraphqlContext
    ) {
      const padResource = `/pads/${padId}`;
      const user = await check(padResource, context, 'WRITE');

      const form = await getForm(padId, userFileName, fileType);

      const data = await tables();
      const newFileAttachment = {
        id: nanoid(),
        user_id: user.id,
        resource_uri: padResource,
        user_filename: userFileName,
        filename: form.fileName,
        filetype: form.fileType,
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

    async getAttachmentURL(
      _: any,
      { attachmentId }: { attachmentId: string },
      context: GraphqlContext
    ): Promise<string> {
      const data = await tables();
      const attachment = await data.fileattachments.get({ id: attachmentId });
      if (!attachment) {
        throw new UserInputError('No such attachment was found');
      }

      await check(attachment.resource_uri, context, 'READ');

      return await getURL(attachment.filename);
    },
  },

  Mutation: {
    async attachFileToPad(
      _: any,
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

      const resource = attachment.resource_uri;
      await check(resource, context, 'WRITE');

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
        createdAt: newFileAttachment.createdAt!,
        fileSize: newFileAttachment.filesize,
      };
    },

    async removeAttachmentFromPad(
      _: any,
      { attachmentId }: { attachmentId: string },
      context: GraphqlContext
    ) {
      const data = await tables();
      const attachment = await data.fileattachments.get({ id: attachmentId });
      if (!attachment) {
        throw new UserInputError('No such attachment was found');
      }

      await check(attachment.resource_uri, context, 'WRITE');
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
          createdAt: fileAttachment.createdAt!,
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
      return await data.users.get({ id: attachment.uploadedByUserId });
    },

    async pad(attachment: Attachment): Promise<Pad | undefined> {
      const data = await tables();
      return await data.pads.get({ id: attachment.padId });
    },
  },
};
