import { CreateAttachmentFormResult } from '@decipad/backendtypes';
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

const { buckets, ...config } = s3Config();
const Bucket = buckets.attachments;
const s3 = new S3Client(config);

const fixURL = (urlString: string): string => {
  const url = new URL(urlString);
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

export const attachmentFilePath = (
  padId: string,
  fileName: string,
  attachmentId: string
): string => `pads/${padId}/${fileName}/${attachmentId}`;

export const attachmentUrl = (padId: string, attachmentId: string): string => {
  const appConfig = getAppConfig();
  return `${appConfig.urlBase}${appConfig.apiPathBase}/pads/${padId}/attachments/${attachmentId}`;
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
  if (!Buffer.isBuffer(content)) {
    throw new Error('Expected buffer as response from s3.getObject');
  }

  return content;
};

export async function getCreateAttachmentForm(
  padId: string,
  fileName: string,
  fileType: string
): Promise<CreateAttachmentFormResult> {
  const key = attachmentFilePath(padId, fileName, nanoid());
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
    url: fixURL(url),
    fileName: key,
    fileType,
  }));
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
  });
  return getSignedUrl(s3, command, {
    expiresIn: maxAttachmentDownloadTokenExpirationSeconds,
  }).then(fixURL);
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
