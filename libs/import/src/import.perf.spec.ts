import { Computer } from '@decipad/computer';
import { createServer, Server } from 'http';
import path from 'path';
import handler from 'serve-handler';
import getPort from 'get-port';
import { getDefined } from '@decipad/utils';
import { tryImport } from '.';

const timeoutMultiplier = process.env.CI ? 2 : 1;

const MAX_BIG_IMPORT_TIMEOUT_MS = 120_000 * timeoutMultiplier;
const MAX_BIGISH_IMPORT_TIMEOUT_MS = 12_000 * timeoutMultiplier;

describe('import performance', () => {
  let server: Server;
  beforeAll(async () => {
    const publicPath = path.resolve(__dirname, '__fixtures__');
    server = createServer((req, res) => {
      handler(req, res, {
        public: publicPath,
      });
    });
    const port = await getPort();
    await new Promise<void>((resolve, reject) => {
      server.once('error', reject);
      server.once('listening', resolve);
      server.listen({ port, host: '127.0.0.1' });
    });
  });

  afterAll(() => {
    return new Promise((resolve) => {
      server.close(resolve);
    });
  });

  it(
    'imports big(ish) csv',
    async () => {
      const computer = new Computer();
      const address = getDefined(server.address());
      const file = '/bigish1.csv';
      const url =
        typeof address === 'string'
          ? new URL(file, address)
          : new URL(file, `http://${address.address}:${address.port}/`);
      const startTime = Date.now();
      const result = await tryImport(
        { computer, url },
        {
          // useFirstRowAsHeader: true,
          useFirstRowAsHeader: true,
        }
      );
      const ellapsed = Date.now() - startTime;
      expect(ellapsed).toBeLessThanOrEqual(MAX_BIGISH_IMPORT_TIMEOUT_MS);
      expect(result).toHaveLength(1);
      expect(result[0].result).toMatchSnapshot('bigish1.csv-import-result');
    },
    MAX_BIGISH_IMPORT_TIMEOUT_MS * 2
  );

  it(
    'imports big csv',
    async () => {
      const computer = new Computer();
      const address = getDefined(server.address());
      const file = '/big1.csv';
      const url =
        typeof address === 'string'
          ? new URL(file, address)
          : new URL(file, `http://${address.address}:${address.port}/`);
      const startTime = Date.now();
      await tryImport(
        { computer, url },
        {
          useFirstRowAsHeader: true,
        }
      );
      const ellapsed = Date.now() - startTime;
      expect(ellapsed).toBeLessThanOrEqual(MAX_BIG_IMPORT_TIMEOUT_MS);
    },
    MAX_BIG_IMPORT_TIMEOUT_MS * 2
  );
});
