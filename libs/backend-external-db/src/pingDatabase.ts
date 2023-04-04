import type { Knex } from 'knex';
import { createDatabaseClient } from './createDatabaseClient';

interface OkPingDatabaseResult {
  type: 'dbconn';
  ok: true;
  clientConfig: Knex.Config;
}
interface KoPingDatabaseResult {
  type: 'dbconn';
  ok: false;
  clientConfig: Knex.Config;
  error: string;
}

type PingDatabaseResult = OkPingDatabaseResult | KoPingDatabaseResult;

export const pingDatabase = async (
  url: string
): Promise<PingDatabaseResult> => {
  const [client, config] = createDatabaseClient(url);
  try {
    await client.raw('select 1+1 as result');
    return {
      type: 'dbconn' as const,
      ok: true,
      clientConfig: config,
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return {
      type: 'dbconn' as const,
      ok: false,
      clientConfig: config,
      error: (err as Error).message,
    };
  } finally {
    await client.destroy();
  }
};
