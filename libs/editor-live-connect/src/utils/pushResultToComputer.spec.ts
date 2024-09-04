import { expect, it } from 'vitest';
// eslint-disable-next-line no-restricted-imports
import {
  getRemoteComputer,
  materializeOneResult,
  runCode,
} from '@decipad/remote-computer';
import { setupDeciNumberSnapshotSerializer } from '@decipad/number';
import { serializeResult } from '@decipad/computer-utils';
import { timeout } from '@decipad/utils';
import { pushResultToComputer } from './pushResultToComputer';

setupDeciNumberSnapshotSerializer();

it('can push a new table into the computer', async () => {
  // We need a first request for the computer to function
  const computer = getRemoteComputer({
    notebookId: 'notebookId',
    initialProgram: [],
  });

  const { type, value } = await runCode(
    'Table1 = { Column1 = [1], Column2 = [2] }\nTable1'
  );

  await pushResultToComputer(
    computer,
    'blockid',
    'Table1',
    serializeResult(type, value, undefined)
  );

  await timeout(100);

  expect(
    await Promise.all(
      Array.from(
        Object.values(computer.results.value.blockResults),
        async (result) => [
          result.id,
          result.result?.value &&
            (await materializeOneResult(result.result?.value)),
        ]
      )
    )
  ).toMatchInlineSnapshot(`
    [
      [
        "blockid",
        [
          [
            DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 1n,
              "s": 1n,
            },
          ],
          [
            DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 2n,
              "s": 1n,
            },
          ],
        ],
      ],
      [
        "blockid--0",
        [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 1n,
            "s": 1n,
          },
        ],
      ],
      [
        "blockid--1",
        [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 2n,
            "s": 1n,
          },
        ],
      ],
    ]
  `);
});
