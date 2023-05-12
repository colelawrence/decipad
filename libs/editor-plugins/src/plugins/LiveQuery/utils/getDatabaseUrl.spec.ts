import { Result, getResultGenerator } from '@decipad/computer';
import { getDatabaseUrl } from './getDatabaseUrl';

test('should return the DB url if it exists', async () => {
  const result: Result.Result<'table'> = {
    type: {
      kind: 'table',
      indexName: 'MySQL',
      columnTypes: [{ kind: 'string' }, { kind: 'string' }],
      columnNames: ['url', 'type'],
    },
    value: ['x', 'dbConn'].map((i) => getResultGenerator([i])),
  };
  const dbUrl = await getDatabaseUrl(result as Result.Result);

  expect(dbUrl).toBe('x');
});

test('should return undefined if the DB url does not exist', async () => {
  const result: Result.Result<'table'> = {
    type: {
      kind: 'table',
      indexName: 'MySQL',
      columnTypes: [{ kind: 'string' }, { kind: 'string' }],
      columnNames: ['bla', 'type'],
    },
    value: ['www.foo.bar', 'dbConn'].map((i) => getResultGenerator([i])),
  };
  const dbUrl = await getDatabaseUrl(result as Result.Result);

  expect(dbUrl).toBeUndefined();
});

test('should return undefined if the result is not a table', async () => {
  const result: Result.Result = {
    type: {
      kind: 'number',
      unit: null,
    },
    value: null,
  };
  const dbUrl = await getDatabaseUrl(result);

  expect(dbUrl).toBeUndefined();
});
