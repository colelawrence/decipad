import { nanoid } from 'nanoid';
// eslint-disable-next-line import/no-extraneous-dependencies
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
// eslint-disable-next-line import/no-extraneous-dependencies
import { tables } from '@architect/functions';
import { DocSyncRecord } from '@decipad/backendtypes';
import { timeout, getDefined } from '../../../utils/src';
import { withLock } from '..';

/* Client */

function createClient(): DynamoDBDocument {
  const port = getDefined(
    process.env.ARC_TABLES_PORT,
    'need process.env.ARC_TABLES_PORT'
  );
  const client = new DynamoDBClient({
    endpoint: { url: new URL(`http://localhost:${port}`) },
    region: process.env.AWS_REGION || 'us-west-2',
    maxAttempts: 10,
    retryMode: 'adaptive',
  });
  return DynamoDBDocument.from(client);
}

/* Writers */

class Writer {
  private seq: number;
  constructor(seq: number) {
    this.seq = seq;
  }

  async write(id: string): Promise<void> {
    const locking = await withLock(createClient(), 'docsync');
    await locking(
      id,
      async (record: Omit<DocSyncRecord, '_version'> = { id, seq: [] }) => {
        record.seq?.push(this.seq);
        await timeout(this.seq * 100);
        return record;
      }
    );
  }
}

function createWriters(writersCount: number): Writer[] {
  const writers: Writer[] = [];
  for (let i = 0; i < writersCount; i += 1) {
    writers.push(new Writer(i));
  }
  return writers;
}

/* Reader */

class Reader {
  private id: string;
  constructor(id: string) {
    this.id = id;
  }

  async read(): Promise<DocSyncRecord | undefined> {
    const client = createClient();
    const getDoc = client.get.bind(client);
    const data = (await tables()) as unknown as {
      reflect: () => Promise<Record<string, string>>;
    };
    const tableNameMap = await data.reflect();

    return (
      await getDoc({
        TableName: tableNameMap.docsync,
        Key: { id: this.id },
        ConsistentRead: true,
      })
    ).Item as DocSyncRecord;
  }
}

function createReader(id: string): Reader {
  return new Reader(id);
}

/* Execute the writes */

export async function concurrentWrites(writersCount: number): Promise<Reader> {
  const writers = createWriters(writersCount);
  const id = nanoid();
  await Promise.all(writers.map((writer) => writer.write(id)));
  return createReader(id);
}
