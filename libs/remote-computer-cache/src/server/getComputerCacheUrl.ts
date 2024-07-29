import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3 as s3Config, app as getAppConfig } from '@decipad/backend-config';
import { computerResultFilePath } from '../utils/computerResultFilePath';
import { fixURL } from './fixURL';

const { buckets, ...config } = s3Config();
const Bucket = buckets.attachments;
const s3 = new S3Client(config);

const {
  limits: { maxAttachmentDownloadTokenExpirationSeconds },
} = getAppConfig();

export const getComputerCacheUrl = (notebookId: string): Promise<string> => {
  let fileName = computerResultFilePath(notebookId);
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
