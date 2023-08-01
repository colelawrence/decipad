import { chunks, noop } from '@decipad/utils';
import {
  DynamoDBDocument,
  BatchWriteCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { debug } from './debug';

const localEnvs = ['development', 'testing'];
const isLocalDevelopment =
  process.env.NODE_ENV && localEnvs.includes(process.env.NODE_ENV);

// local dev version of batchDelete
// this must be different because apparently our
// emulation of DynamoDB does not support batched delete requests
const localBatchDelete = (
  db: DynamoDBDocument,
  tableName: string,
  selectors: Array<{ id: string; seq?: string }>
): Promise<void> => {
  debug('localBatchDelete', { tableName, selectors });
  return Promise.all(
    selectors.map((selector) =>
      db.delete({
        TableName: tableName,
        Key: selector,
      })
    )
  ).then(noop);
};

const realBatchDelete = async (
  db: DynamoDBDocument,
  tableName: string,
  selectors: Array<{ id: string; seq?: string }>
): Promise<void> => {
  debug('realBatchDelete', { tableName, selectors });

  for (const batch of chunks(selectors, 25)) {
    const query: BatchWriteCommandInput = {
      RequestItems: {
        [tableName]: batch.map((selector) => ({
          DeleteRequest: {
            Key: selector,
          },
        })),
      },
    };
    // eslint-disable-next-line no-await-in-loop
    await db.batchWrite(query);
  }
};

export const batchDelete = isLocalDevelopment
  ? localBatchDelete
  : realBatchDelete;
