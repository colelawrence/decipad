import { CreateAttachmentFormResult } from '@decipad/backendtypes';
// eslint-disable-next-line import/no-extraneous-dependencies
import S3 from 'aws-sdk/clients/s3';
import { nanoid } from 'nanoid';
import { s3 as s3Config, app as getAppConfig } from '@decipad/backend-config';
import { URL } from 'url';

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
  const result = await s3
    .getObject({
      Bucket,
      Key: fileName,
    })
    .promise();

  const content = result.Body;
  if (!Buffer.isBuffer(content)) {
    throw new Error('Expected buffer as response from s3.getObject');
  }

  return content;
};

export function getCreateAttachmentForm(
  padId: string,
  fileName: string,
  fileType: string
): Promise<CreateAttachmentFormResult> {
  return new Promise((resolve, reject) => {
    const key = attachmentFilePath(padId, fileName, nanoid());
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
        (err, { url, ...data }) => {
          if (err) {
            reject(err);
          } else {
            resolve({
              ...data,
              url: fixURL(url),
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

export const getSize = (fileName: string): Promise<number> => {
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
};

export const getURL = (fileName: string): Promise<string> => {
  if (fileName.startsWith('/')) {
    fileName = fileName.substring(1);
  }
  return s3
    .getSignedUrlPromise('getObject', {
      Bucket,
      Key: fileName,
      Expires: maxAttachmentDownloadTokenExpirationSeconds,
    })
    .then(fixURL);
};

export const remove = async (fileName: string) => {
  if (fileName.startsWith('/')) {
    fileName = fileName.substring(1);
  }

  await s3.deleteObject({
    Bucket,
    Key: fileName,
  });
};

export const duplicate = (from: string, to: string) => {
  return s3
    .copyObject({
      Bucket,
      CopySource: `${Bucket}/${from}`,
      Key: to,
    })
    .promise();
};
