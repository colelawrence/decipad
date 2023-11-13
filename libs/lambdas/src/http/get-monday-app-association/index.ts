import { isReadableStream } from 'is-stream';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { s3 as s3Config } from '@decipad/backend-config';
import handle from '../handle';
import Boom from '@hapi/boom';

export const handler = handle(async (event: APIGatewayProxyEventV2) => {
  if (event.rawPath === '/monday-app-association.json') {
    const { buckets, ...config } = s3Config();
    const Bucket = buckets.thirdParties;
    const s3 = new S3Client(config);

    try {
      const command = new GetObjectCommand({
        Bucket,
        Key: 'monday-app-association.json',
      });

      const result = await s3.send(command);
      const content = result.Body;
      if (isReadableStream(content)) {
        const readableContent = await content.transformToString('utf8');
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: readableContent,
        };
      }
    } catch (error) {
      return {
        statusCode: 500,
        body: `Error reading JSON file: ${error}`,
      };
    }
  }

  throw Boom.notFound('JSON file not found');
});
