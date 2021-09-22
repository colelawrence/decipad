import { promisify } from 'util';
import { nanoid } from 'nanoid';
// eslint-disable-next-line import/no-extraneous-dependencies
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Endpoint } from 'aws-sdk';
import { tables } from '@architect/functions';
import { DocSyncRecord } from '@decipad/backendtypes';
import { timeout, getDefined } from '@decipad/utils';
import { withLock } from '..';

/* Client */

function createClient(): DocumentClient {
  const port = getDefined(
    process.env.ARC_TABLES_PORT,
    'need process.env.ARC_TABLES_PORT'
  );
  return new DocumentClient({
    endpoint: new Endpoint(`http://localhost:${port}`),
    region: process.env.AWS_REGION || 'us-west-2',
  });
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
    const getDoc = promisify(client.get.bind(client));
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
