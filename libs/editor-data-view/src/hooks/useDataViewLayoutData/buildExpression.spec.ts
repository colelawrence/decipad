import { runCode, Time } from '@decipad/computer';
import { N } from '@decipad/number';
import { buildExpression } from './buildExpression';
import { Column } from '../../types';

describe('buildExpression', () => {
  it('empty query just returns table', async () => {
    const columns: Column[] = [
      {
        blockId: 'Column1',
        type: { kind: 'string' },
        value: ['a', 'b', 'c'],
        name: 'Column1',
      },
    ];
    const result = await runCode(`
      Table = {Column1 = ["a","b","c"], Column2 = [1,2,3]}
      ${buildExpression('Table', 'Column1', [], columns, undefined)}
    `);
    expect(result.value).toMatchObject(['a', 'b', 'c']);
  });

  it('empty filter with roundings', async () => {
    const columns: Column[] = [
      {
        blockId: 'Column2',
        type: { kind: 'string' },
        value: [N(1.23), N(4.56), N(7.89)],
        name: 'Column2',
      },
    ];
    const result = await runCode(`
      Table = {Column1 = ["a","b","c"], Column2 = [1.23,4.56,7.89]}
      ${buildExpression('Table', 'Column2', [], columns, '1')}
    `);
    expect(result.value).toMatchObject([N(1.2), N(4.6), N(7.9)]);
  });

  it('filter string field with in operation', async () => {
    const columns: Column[] = [
      {
        blockId: 'Column1',
        type: { kind: 'string' },
        value: ['a', 'b', 'c'],
        name: 'Column1',
      },
    ];
    const filters = [{ operation: 'in', valueOrValues: ['a', 'b'] }];
    const result = await runCode(`
      Table = {Column1 = ["a","b","c"], Column2 = [1,2,3]}
      ${buildExpression('Table', 'Column1', filters as any, columns, undefined)}
    `);
    expect(result.value).toMatchObject(['a', 'b']);

    const result2 = await runCode(`
      Table = {Column1 = ["a","b","c"], Column2 = [1,2,3]}
      ${buildExpression('Table', 'Column2', filters as any, columns, undefined)}
    `);
    expect(result2.value).toMatchObject([N(1), N(2)]);
  });
});

it('filter number field with eq operation', async () => {
  const columns: Column[] = [
    {
      blockId: 'Column2',
      type: { kind: 'number' },
      value: [N(1), N(2), N(3)],
      name: 'Column2',
    },
  ];

  const result = await runCode(`
    Table = {Column1 = ["a","b","c"], Column2 = [1,2,3]}
    ${buildExpression('Table', 'Column2', [{ operation: 'eq' }], columns)}
    `);
  expect(result.value).toMatchObject([N(1), N(2), N(3)]);

  const result2 = await runCode(`
    Table = {Column1 = ["a","b","c"], Column2 = [1,2,3]}
    ${buildExpression(
      'Table',
      'Column2',
      [{ operation: 'eq', valueOrValues: 1 }],
      columns
    )}
    `);

  expect(result2.value).toMatchObject([N(1)]);
});

it('filter number field with ne operation', async () => {
  const columns: Column[] = [
    {
      blockId: 'Column2',
      type: { kind: 'number' },
      value: [N(1), N(2), N(3)],
      name: 'Column2',
    },
  ];

  const result = await runCode(`
    Table = {Column1 = ["a","b","c"], Column2 = [1,2,3]}
    ${buildExpression('Table', 'Column2', [{ operation: 'ne' }], columns)}
    `);
  expect(result.value).toMatchObject([N(1), N(2), N(3)]);

  const result2 = await runCode(`
    Table = {Column1 = ["a","b","c"], Column2 = [1,2,3]}
    ${buildExpression(
      'Table',
      'Column2',
      [{ operation: 'ne', valueOrValues: 2 }],
      columns
    )}
    `);

  expect(result2.value).toMatchObject([N(1), N(3)]);
});

it('filter date field with eq operation', async () => {
  const columns: Column[] = [
    {
      blockId: 'Column2',
      type: { kind: 'date', date: 'day' },
      value: [
        Time.parseUTCDate('2006-02-01'),
        Time.parseUTCDate('2006-02-02'),
        Time.parseUTCDate('2006-02-03'),
      ],
      name: 'Column2',
    },
  ];

  const result = await runCode(`
    Table = { Column1 = ["a","b","c"], Column2 = [date(2006-02-01),date(2006-02-02),date(2006-02-03)] }
    ${buildExpression('Table', 'Column2', [{ operation: 'eq' }], columns)}
    `);
  expect(result.value).toMatchObject([
    Time.parseUTCDate('2006-02-01'),
    Time.parseUTCDate('2006-02-02'),
    Time.parseUTCDate('2006-02-03'),
  ]);

  const result2 = await runCode(`
    Table = { Column1 = ["a","b","c"], Column2 = [date(2006-02-01),date(2006-02-02),date(2006-02-03)] }
    ${buildExpression(
      'Table',
      'Column2',
      [{ operation: 'eq', valueOrValues: '2006-02-02' }],
      columns
    )}
    `);

  expect(result2.value).toMatchObject([Time.parseUTCDate('2006-02-02')]);
});

it('filter date field with ne operation', async () => {
  const columns: Column[] = [
    {
      blockId: 'Column2',
      type: { kind: 'date', date: 'day' },
      value: [
        Time.parseUTCDate('2006-02-01'),
        Time.parseUTCDate('2006-02-02'),
        Time.parseUTCDate('2006-02-03'),
      ],
      name: 'Column2',
    },
  ];

  const result = await runCode(`
    Table = { Column1 = ["a","b","c"], Column2 = [date(2006-02-01),date(2006-02-02),date(2006-02-03)] }
    ${buildExpression('Table', 'Column2', [{ operation: 'ne' }], columns)}
    `);
  expect(result.value).toMatchObject([
    Time.parseUTCDate('2006-02-01'),
    Time.parseUTCDate('2006-02-02'),
    Time.parseUTCDate('2006-02-03'),
  ]);

  const result2 = await runCode(`
    Table = { Column1 = ["a","b","c"], Column2 = [date(2006-02-01),date(2006-02-02),date(2006-02-03)] }
    ${buildExpression(
      'Table',
      'Column2',
      [{ operation: 'ne', valueOrValues: '2006-02-02' }],
      columns
    )}
    `);

  expect(result2.value).toMatchObject([
    Time.parseUTCDate('2006-02-01'),
    Time.parseUTCDate('2006-02-03'),
  ]);
});

it('filter boolean field with eq operation', async () => {
  const columns: Column[] = [
    {
      blockId: 'Column1',
      type: { kind: 'boolean' },
      value: [true, false, true],
      name: 'Column2',
    },
  ];

  const result = await runCode(`
    Table = {Column1 = ["a","b","c"], Column2 = [true, false, true]}
    ${buildExpression(
      'Table',
      'Column1',
      [{ operation: 'eq', valueOrValues: true }],
      columns
    )}
    `);
  expect(result.value).toMatchObject(['a', 'c']);

  const result2 = await runCode(`
    Table = {Column1 = ["a","b","c"], Column2 = [true, false, true]}
    ${buildExpression(
      'Table',
      'Column1',
      [{ operation: 'eq', valueOrValues: false }],
      columns
    )}
    `);
  expect(result2.value).toMatchObject(['b']);
});

it('filter date field with bt operation', async () => {
  const columns: Column[] = [
    {
      blockId: 'Column2',
      type: { kind: 'date', date: 'day' },
      value: [
        Time.parseUTCDate('2006-02-01'),
        Time.parseUTCDate('2006-02-02'),
        Time.parseUTCDate('2006-02-03'),
        Time.parseUTCDate('2006-02-04'),
      ],
      name: 'Column2',
    },
  ];

  const result = await runCode(`
    Table = { Column1 = ["a","b","c","d"], Column2 = [date(2006-02-01),date(2006-02-02),date(2006-02-03),date(2006-02-04)] }
    ${buildExpression('Table', 'Column2', [{ operation: 'bt' }], columns)}
    `);
  expect(result.value).toMatchObject([
    Time.parseUTCDate('2006-02-01'),
    Time.parseUTCDate('2006-02-02'),
    Time.parseUTCDate('2006-02-03'),
    Time.parseUTCDate('2006-02-04'),
  ]);

  const result2 = await runCode(`
    Table = { Column1 = ["a","b","c","d"], Column2 = [date(2006-02-01),date(2006-02-02),date(2006-02-03),date(2006-02-04)] }
    ${buildExpression(
      'Table',
      'Column2',
      [{ operation: 'bt', valueOrValues: [undefined, undefined] }],
      columns
    )}
    `);
  expect(result2.value).toMatchObject([
    Time.parseUTCDate('2006-02-01'),
    Time.parseUTCDate('2006-02-02'),
    Time.parseUTCDate('2006-02-03'),
    Time.parseUTCDate('2006-02-04'),
  ]);

  const result3 = await runCode(`
    Table = { Column1 = ["a","b","c","d"], Column2 = [date(2006-02-01),date(2006-02-02),date(2006-02-03),date(2006-02-04)] }
    ${buildExpression(
      'Table',
      'Column2',
      [{ operation: 'bt', valueOrValues: ['2006-02-02', undefined] }],
      columns
    )}
    `);
  expect(result3.value).toMatchObject([
    Time.parseUTCDate('2006-02-02'),
    Time.parseUTCDate('2006-02-03'),
    Time.parseUTCDate('2006-02-04'),
  ]);

  const result4 = await runCode(`
    Table = { Column1 = ["a","b","c","d"], Column2 = [date(2006-02-01),date(2006-02-02),date(2006-02-03),date(2006-02-04)] }
    ${buildExpression(
      'Table',
      'Column2',
      [{ operation: 'bt', valueOrValues: [undefined, '2006-02-03'] }],
      columns
    )}
    `);
  expect(result4.value).toMatchObject([
    Time.parseUTCDate('2006-02-01'),
    Time.parseUTCDate('2006-02-02'),
    Time.parseUTCDate('2006-02-03'),
  ]);

  const result5 = await runCode(`
    Table = { Column1 = ["a","b","c","d"], Column2 = [date(2006-02-01),date(2006-02-02),date(2006-02-03),date(2006-02-04)] }
    ${buildExpression(
      'Table',
      'Column2',
      [{ operation: 'bt', valueOrValues: ['2006-02-02', '2006-02-03'] }],
      columns
    )}
    `);
  expect(result5.value).toMatchObject([
    Time.parseUTCDate('2006-02-02'),
    Time.parseUTCDate('2006-02-03'),
  ]);
});

it('filter umber field with bt operation', async () => {
  const columns: Column[] = [
    {
      blockId: 'Column2',
      type: { kind: 'number' },
      value: [N(1), N(2), N(3), N(4)],
      name: 'Column2',
    },
  ];

  const result = await runCode(`
    Table = { Column1 = ["a","b","c","d"], Column2 = [1,2,3,4] }
    ${buildExpression('Table', 'Column2', [{ operation: 'bt' }], columns)}
    `);
  expect(result.value).toMatchObject([N(1), N(2), N(3), N(4)]);
  const result2 = await runCode(`
    Table = { Column1 = ["a","b","c","d"], Column2 = [1,2,3,4] }
    ${buildExpression(
      'Table',
      'Column2',
      [{ operation: 'bt', valueOrValues: [undefined, undefined] }],
      columns
    )}
    `);
  expect(result2.value).toMatchObject([N(1), N(2), N(3), N(4)]);

  const result3 = await runCode(`
    Table = { Column1 = ["a","b","c","d"], Column2 = [1,2,3,4] }
    ${buildExpression(
      'Table',
      'Column2',
      [{ operation: 'bt', valueOrValues: [2, undefined] }],
      columns
    )}
    `);
  expect(result3.value).toMatchObject([N(2), N(3), N(4)]);

  const result4 = await runCode(`
    Table = { Column1 = ["a","b","c","d"], Column2 = [1,2,3,4] }
    ${buildExpression(
      'Table',
      'Column2',
      [{ operation: 'bt', valueOrValues: [undefined, 3] }],
      columns
    )}
    `);
  expect(result4.value).toMatchObject([N(1), N(2), N(3)]);

  const result5 = await runCode(`
    Table = { Column1 = ["a","b","c","d"], Column2 = [1,2,3,4] }
    ${buildExpression(
      'Table',
      'Column2',
      [{ operation: 'bt', valueOrValues: [2, 3] }],
      columns
    )}
    `);
  expect(result5.value).toMatchObject([N(2), N(3)]);
});
