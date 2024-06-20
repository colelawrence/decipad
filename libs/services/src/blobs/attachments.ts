import type { CreateAttachmentFormResult } from '@decipad/backendtypes';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { nanoid } from 'nanoid';
import { s3 as s3Config, app as getAppConfig } from '@decipad/backend-config';
import { URL } from 'url';
import { isReadableStream } from 'is-stream';
import { getStreamAsBuffer } from 'get-stream';

const { buckets, ...config } = s3Config();
const Bucket = buckets.attachments;
const s3 = new S3Client(config);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const fixURL = (urlString: string, _cors = false): string => {
  const url = new URL(urlString);
  // if (cors && url.hostname === 's3.eu-west-2.amazonaws.com') {
  //   url.hostname = `${Bucket}.${url.hostname}`;
  // }
  if (url.hostname.endsWith('amazonaws.com') && url.protocol === 'http:') {
    url.protocol = 'https';
  }
  return url.toString();
};

const {
  limits: {
    maxAttachmentSize,
    maxAttachmentUploadTokenExpirationSeconds,
    maxAttachmentDownloadTokenExpirationSeconds,
  },
} = getAppConfig();

const genericAttachmentFilePath = (
  fileName: string,
  attachmentId: string
): string => `${fileName}/${attachmentId}`;

export const attachmentFilePath = (
  padId: string,
  fileName: string,
  attachmentId: string
): string =>
  `pads/${padId}/${genericAttachmentFilePath(fileName, attachmentId)}`;

export const attachmentFilePathWorkspace = (
  workspaceId: string,
  fileName: string,
  attachmentId: string
): string =>
  `workspaces/${workspaceId}/${genericAttachmentFilePath(
    fileName,
    attachmentId
  )}`;

export const attachmentUrl = (padId: string, attachmentId: string): string => {
  const appConfig = getAppConfig();
  return `${appConfig.urlBase}${appConfig.apiPathBase}/pads/${padId}/attachments/${attachmentId}`;
};

export const attachmentUrlWorkspace = (
  workspaceId: string,
  attachmentId: string
): string => {
  const appConfig = getAppConfig();
  return `${appConfig.urlBase}${appConfig.apiPathBase}/workspaces/${workspaceId}/attachments/${attachmentId}`;
};

export const getAttachmentContent = async (
  fileName: string
): Promise<Buffer> => {
  const command = new GetObjectCommand({
    Bucket,
    Key: fileName,
  });
  const result = await s3.send(command);
  const content = result.Body;
  if (isReadableStream(content)) {
    return getStreamAsBuffer(content);
  }
  if (!Buffer.isBuffer(content)) {
    throw new Error('Expected buffer as response from s3.getObject');
  }

  return content;
};

async function attachS3(
  key: string,
  fileType: string
): Promise<CreateAttachmentFormResult> {
  return createPresignedPost(s3, {
    Key: key,
    Bucket,
    Fields: {
      key,
      'Content-Type': fileType,
    },
    Expires: maxAttachmentUploadTokenExpirationSeconds,
    Conditions: [['content-length-range', 0, maxAttachmentSize]],
  }).then(({ url, ...data }) => ({
    ...data,
    url: fixURL(url, true),
    fileName: key,
    fileType,
  }));
}

export async function getCreateAttachmentForm(
  padId: string,
  fileName: string,
  fileType: string
): Promise<CreateAttachmentFormResult> {
  const key = attachmentFilePath(padId, fileName, nanoid());

  return attachS3(key, fileType);
}

export async function getCreateAttachmentFormWorkspace(
  workspaceId: string,
  fileName: string,
  fileType: string
): Promise<CreateAttachmentFormResult> {
  const key = attachmentFilePathWorkspace(workspaceId, fileName, nanoid());

  return attachS3(key, fileType);
}

export const getSize = async (fileName: string): Promise<number> => {
  const command = new HeadObjectCommand({
    Bucket,
    Key: fileName,
  });
  const result = await s3.send(command);
  if (!result.ContentLength) {
    throw new Error(`Attachment file with name ${fileName} not found`);
  }
  return result.ContentLength;
};

export const getURL = (fileName: string): Promise<string> => {
  if (fileName.startsWith('/')) {
    fileName = fileName.substring(1);
  }
  const command = new GetObjectCommand({
    Bucket,
    Key: fileName,
    ResponseCacheControl: 'private, max-age=31536000, immutable',
  });
  return getSignedUrl(
    s3 as Parameters<typeof getSignedUrl>[0],
    command as Parameters<typeof getSignedUrl>[1],
    {
      expiresIn: maxAttachmentDownloadTokenExpirationSeconds,
    }
  ).then(fixURL);
};

export const remove = async (fileName: string) => {
  if (fileName.startsWith('/')) {
    fileName = fileName.substring(1);
  }

  const command = new DeleteObjectCommand({
    Bucket,
    Key: fileName,
  });

  await s3.send(command);
};

export const duplicate = (from: string, to: string) => {
  const command = new CopyObjectCommand({
    Bucket,
    CopySource: `${Bucket}/${from}`,
    Key: to,
  });
  return s3.send(command);
};
