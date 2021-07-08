import S3 from 'aws-sdk/clients/s3';
import { nanoid } from 'nanoid';
import { s3 as s3Config, app as appConfig } from '../config';

const { buckets, ...config } = s3Config();
const options = {
  ...config,
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
    const key = `/pads/${padId}/${fileName}/${nanoid()}`;
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
            return reject(err);
          }
          resolve({
            ...data,
            fileName: key,
            fileType,
          });
        }
      );
    } catch (err) {
      reject(err);
    }
  });
}

export async function getSize(fileName: string): Promise<number> {
  return new Promise((resolve, reject) => {
    if (fileName.startsWith('/')) {
      fileName = fileName.substring(1);
    }
    try {
      s3.headObject(
        {
          Bucket,
          Key: fileName,
        },
        (err, data) => {
          if (err) {
            return reject(err);
          }
          if (!data) {
            throw new Error(`Attachment file with name ${fileName} not found`);
          }
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
  return await s3.getSignedUrlPromise('getObject', {
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
