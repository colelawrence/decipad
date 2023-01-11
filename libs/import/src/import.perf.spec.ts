import { Computer } from '@decipad/computer';
import { createServer, Server } from 'http';
import path from 'path';
import handler from 'serve-handler';
import getPort from 'get-port';
import { getDefined } from '@decipad/utils';
import { tryImport } from '.';

const MAX_BIG_IMPORT_TIMEOUT_MS = 30_000;

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
    'imports big csv',
    async () => {
      const computer = new Computer();
      const address = getDefined(server.address());
      const file = '/big1.csv';
      const url =
        typeof address === 'string'
          ? new URL(file, address)
          : new URL(file, `http://${address.address}:${address.port}/`);
      const result = await tryImport(computer, url, undefined, {
        useFirstRowAsHeader: true,
      });
      expect(result).toHaveLength(1);
      expect(result[0].result).toMatchSnapshot('big1.csv-import-result');
    },
    MAX_BIG_IMPORT_TIMEOUT_MS
  );
});
