import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { S3Client } from '@aws-sdk/client-s3';
import { s3 as s3Config, app as getAppConfig } from '@decipad/backend-config';
import { CreateAttachmentFormResult } from '../types';
import { computerResultFilePath } from '../utils/computerResultFilePath';
import { fixURL } from './fixURL';

const { buckets, ...config } = s3Config();
const Bucket = buckets.attachments;
const s3 = new S3Client(config);

const {
  limits: { maxAttachmentSize, maxAttachmentUploadTokenExpirationSeconds },
} = getAppConfig();

async function getS3PostForm(key: string): Promise<CreateAttachmentFormResult> {
  return createPresignedPost(s3, {
    Key: key,
    Bucket,
    Fields: {
      key,
      'Content-Type': 'application/octet-stream',
    },
    Expires: maxAttachmentUploadTokenExpirationSeconds,
    Conditions: [['content-length-range', 0, maxAttachmentSize]],
  }).then(({ url, ...data }) => ({
    ...data,
    url: fixURL(url),
    key,
  }));
}

export async function getPostComputerCacheForm(
  notebookId: string
): Promise<CreateAttachmentFormResult> {
  return getS3PostForm(computerResultFilePath(notebookId));
}
