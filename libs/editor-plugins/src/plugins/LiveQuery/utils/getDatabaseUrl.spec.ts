import { Result } from '@decipad/computer';
import { getDatabaseUrl } from './getDatabaseUrl';

test('should return the DB url if it exists', () => {
  const result: Result.Result = {
    type: {
      kind: 'table',
      indexName: 'MySQL',
      columnTypes: [{ kind: 'string' }, { kind: 'string' }],
      columnNames: ['url', 'type'],
    },
    value: ['x', 'dbConn'],
  };
  const dbUrl = getDatabaseUrl(result);

  expect(dbUrl).toBe('x');
});

test('should return undefined if the DB url does not exist', () => {
  const result: Result.Result = {
    type: {
      kind: 'table',
      indexName: 'MySQL',
      columnTypes: [{ kind: 'string' }, { kind: 'string' }],
      columnNames: ['bla', 'type'],
    },
    value: ['www.foo.bar', 'dbConn'],
  };
  const dbUrl = getDatabaseUrl(result);

  expect(dbUrl).toBeUndefined();
});

test('should return undefined if the result is not a table', () => {
  const result: Result.Result = {
    type: {
      kind: 'number',
      unit: null,
    },
    value: null,
  };
  const dbUrl = getDatabaseUrl(result);

  expect(dbUrl).toBeUndefined();
});
