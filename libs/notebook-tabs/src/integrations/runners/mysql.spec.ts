import { it, expect, describe, beforeEach } from 'vitest';
import { SQLRunner } from './mysql';
import { Computer, parseBlockOrThrow } from '@decipad/computer';

describe('Returns the ID of variables used in the query', () => {
  let runner: SQLRunner = {} as any;
  let computer = new Computer();

  beforeEach(() => {
    runner = new SQLRunner('id', {
      runner: {},
      padId: 'pad-id',
      filters: [],
      importer: {},
    });
    computer = new Computer();
  });

  it('returns no IDs if no variables are used', () => {
    runner.setOptions({ runner: { query: 'SELECT * FROM TABLE;' } });
    expect(runner.getUsedVariableIds(computer)).toHaveLength(0);
  });

  it('returns the IDs of all variables used', async () => {
    runner.setOptions({
      runner: { query: 'SELECT * FROM TABLE WHERE time = {{Date}};' },
    });

    await computer.pushComputeDelta({
      program: {
        upsert: [
          {
            id: 'date',
            type: 'identified-block',
            block: parseBlockOrThrow('Date = 100', 'date'),
          },
        ],
      },
    });

    expect(computer.getVarResult('Date')).not.toBeUndefined();
    expect(runner.getUsedVariableIds(computer)).toHaveLength(1);
  });

  it('throws an error if you used variables that are not in the computer', async () => {
    runner.setOptions({
      runner: { query: 'SELECT * FROM TABLE WHERE time = {{Date}};' },
    });

    await computer.pushComputeDelta({
      program: {
        upsert: [
          {
            id: 'date',
            type: 'identified-block',
            block: parseBlockOrThrow('AnotherDate = 100', 'date'),
          },
        ],
      },
    });

    expect(computer.getVarResult('AnotherDate')).not.toBeUndefined();
    expect(() => runner.getUsedVariableIds(computer))
      .toThrowErrorMatchingInlineSnapshot(`
      [Error: Not all variables are defined. Undefined variables: 
      Date]
    `);
  });
});
