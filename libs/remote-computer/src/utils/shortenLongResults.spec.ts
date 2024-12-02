/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable func-names */
import { it, expect } from 'vitest';
import {
  LONG_COLUMN_SHORTENED_LENGTH,
  shortenLongResults,
} from './shortenLongResults';
import { NotebookResults, Result, buildResult } from '..';
import { N } from '@decipad/number';
import { count } from '@decipad/generator-utils';

const shortenResults = shortenLongResults(LONG_COLUMN_SHORTENED_LENGTH);

it('returns all results if none are columns', async () => {
  const smallResults: NotebookResults = {
    blockResults: {
      id1: {
        id: 'id1',
        type: 'computer-result',
        epoch: 0n,
        result: buildResult({ kind: 'number' }, N(10)) as Result.Result,
      },
      id2: {
        id: 'id2',
        type: 'computer-result',
        epoch: 0n,
        result: buildResult({ kind: 'string' }, 'abc') as Result.Result,
      },
      id3: {
        id: 'id3',
        type: 'computer-result',
        epoch: 0n,
        result: buildResult({ kind: 'number' }, N(20)) as Result.Result,
      },
      id4: {
        id: 'id4',
        type: 'computer-result',
        epoch: 0n,
        result: buildResult({ kind: 'boolean' }, false) as Result.Result,
      },
    },
  };

  await expect(shortenResults(smallResults)).resolves.toMatchObject(
    smallResults
  );
});

it('returns all results if none are long enough', async () => {
  const smallResults: NotebookResults = {
    blockResults: {
      id1: {
        id: 'id1',
        type: 'computer-result',
        epoch: 0n,
        result: buildResult(
          {
            kind: 'column',
            cellType: { kind: 'number' },
            indexedBy: null,
            atParentIndex: null,
          },
          async function* value() {
            yield N(1);
            yield N(2);
            yield N(3);
          }
        ) as Result.Result,
      },
    },
  };

  await expect(shortenResults(smallResults)).resolves.toMatchInlineSnapshot(`
    {
      "blockResults": {
        "id1": {
          "epoch": 0n,
          "id": "id1",
          "result": {
            "meta": undefined,
            "type": {
              "atParentIndex": null,
              "cellType": {
                "kind": "number",
              },
              "indexedBy": null,
              "kind": "column",
            },
            "value": [Function],
          },
          "type": "computer-result",
        },
      },
    }
  `);
});

it('shortens longer columns', async () => {
  const smallResults: NotebookResults = {
    blockResults: {
      id1: {
        id: 'id1',
        type: 'computer-result',
        epoch: 0n,
        result: buildResult(
          {
            kind: 'column',
            cellType: { kind: 'number' },
            indexedBy: null,
            atParentIndex: null,
          },
          async function* () {
            while (true) {
              yield N(1);
            }
          }
        ) as Result.Result,
      },
    },
  };

  const { blockResults } = await shortenResults(smallResults);
  expect(Object.keys(blockResults)).toHaveLength(1);

  const length = await count(
    (blockResults.id1.result! as Result.Result<'column'>).value()
  );

  expect(length).toBe(LONG_COLUMN_SHORTENED_LENGTH);
});

it('shortens table results', async () => {
  const smallResults: NotebookResults = {
    blockResults: {
      id1: {
        id: 'id1',
        type: 'computer-result',
        epoch: 0n,
        result: buildResult(
          {
            kind: 'table',
            columnNames: ['col1', 'col2'],
            indexName: 'col1',
            columnTypes: [{ kind: 'number' }, { kind: 'number' }],
          },
          [
            async function* () {
              while (true) {
                yield N(1);
              }
            },
            async function* () {
              while (true) {
                yield N(1);
              }
            },
          ]
        ) as Result.Result,
      },
    },
  };

  const { blockResults } = await shortenResults(smallResults);
  expect(Object.keys(blockResults)).toHaveLength(1);

  const tableResult = blockResults.id1.result! as Result.Result<'table'>;

  await expect(
    Promise.all([count(tableResult.value[0]()), count(tableResult.value[1]())])
  ).resolves.toStrictEqual([
    LONG_COLUMN_SHORTENED_LENGTH,
    LONG_COLUMN_SHORTENED_LENGTH,
  ]);
});
