import { CreateAttachmentFormResult } from '@decipad/backendtypes';
// eslint-disable-next-line import/no-extraneous-dependencies
import S3 from 'aws-sdk/clients/s3';
import { nanoid } from 'nanoid';
import { s3 as s3Config, app as appConfig } from '@decipad/config';

const { buckets, ...config } = s3Config();
const options = {
  ...config,
  // @ts-expect-error Architect uses env name testing instead of the conventional test
  sslEnabled: process.env.NODE_ENV !== 'testing',
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
};

const Bucket = buckets.attachments;
const s3 = new S3(options);

const {
  limits: {
    maxAttachmentSize,
    maxAttachmentUploadTokenExpirationSeconds,
    maxAttachmentDownloadTokenExpirationSeconds,
  },
} = appConfig();

export async function getCreateAttachmentForm(
  padId: string,
  fileName: string,
  fileType: string
): Promise<CreateAttachmentFormResult> {
  return new Promise((resolve, reject) => {
    const key = `pads/${padId}/${fileName}/${nanoid()}`;
    try {
      s3.createPresignedPost(
        {
          Bucket,
          Fields: {
            key,
            'Content-Type': fileType,
          },
          Expires: maxAttachmentUploadTokenExpirationSeconds,
          Conditions: [['content-length-range', 0, maxAttachmentSize]],
        },
        (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve({
              ...data,
              fileName: key,
              fileType,
            });
          }
        }
      );
    } catch (err) {
      reject(err);
    }
  });
}

export async function getSize(fileName: string): Promise<number> {
  return new Promise((resolve, reject) => {
    try {
      s3.headObject(
        {
          Bucket,
          Key: fileName,
        },
        (err, data) => {
          if (err) {
            reject(err);
            return;
          }
          if (!data) {
            throw new Error(`Attachment file with name ${fileName} not found`);
          }
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          resolve(data.ContentLength!);
        }
      );
    } catch (err) {
      reject(err);
    }
  });
}

export async function getURL(fileName: string): Promise<string> {
  if (fileName.startsWith('/')) {
    fileName = fileName.substring(1);
  }
  return s3.getSignedUrlPromise('getObject', {
    Bucket,
    Key: fileName,
    Expires: maxAttachmentDownloadTokenExpirationSeconds,
  });
}

export async function remove(fileName: string) {
  if (fileName.startsWith('/')) {
    fileName = fileName.substring(1);
  }

  await s3.deleteObject({
    Bucket,
    Key: fileName,
  });
}
