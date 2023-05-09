import { promisify } from 'util';
// eslint-disable-next-line import/no-extraneous-dependencies
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { tables } from '@architect/functions';
import {
  VersionedDataTables,
  VersionedTableRecord,
} from '@decipad/backendtypes';
import { PromiseOrType, getDefined } from '../../utils/src';

export type WithLockUserFunction<T> = (
  record: T | undefined
) => PromiseOrType<Omit<T, '_version'>>;

type WithLock<T> = {
  (id: string, fn: WithLockUserFunction<T>): Promise<T>;
};

interface ErrorWithCode extends Error {
  code?: string;
}

export function withLock<RecordType extends VersionedTableRecord>(
  docs: DocumentClient,
  tableName: string & keyof VersionedDataTables
): WithLock<RecordType> {
  const getDoc = promisify(docs.get.bind(docs));
  const putDoc = promisify(docs.put.bind(docs));

  return async function _withLock(
    id: string,
    fn: WithLockUserFunction<RecordType>
  ): Promise<RecordType> {
    const data = (await tables()) as unknown as {
      reflect: () => Promise<Record<string, string>>;
    };
    const tableNameMap = await data.reflect();
    const realTableName = getDefined(
      tableNameMap[tableName],
      `no table named ${tableName.toString()}`
    );
    const record = (
      await getDoc({
        TableName: realTableName,
        Key: { id },
        ConsistentRead: true,
      })
    ).Item as RecordType | undefined;

    // eslint-disable-next-line no-underscore-dangle
    const previousVersion = record == null ? 0 : Number(record._version);
    const returnedRecord = getDefined(
      await fn(record),
      'withLock function must return record'
    );
    const newRecord = {
      ...returnedRecord,
      _version: previousVersion + 1,
    };
    try {
      const conditionExpression =
        '#version = :version OR attribute_not_exists(id)';
      const expressionAttributeValues = {
        ':version': previousVersion,
      };
      await putDoc({
        TableName: realTableName,
        Item: newRecord,
        ConditionExpression: conditionExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ExpressionAttributeNames: {
          '#version': '_version',
        },
      });
    } catch (_err) {
      const err = _err as ErrorWithCode;
      if (err.code === 'ConditionalCheckFailedException') {
        // retry
        return _withLock(id, fn);
      }

      throw err;
    }
    return newRecord as unknown as RecordType;
  };
}
