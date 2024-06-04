// eslint-disable-next-line no-restricted-imports
import {
  getRemoteComputer,
  materializeOneResult,
  runCode,
} from '@decipad/remote-computer';
import { setupDeciNumberSnapshotSerializer } from '@decipad/number';
import { serializeResult } from '@decipad/computer-utils';
import { pushResultToComputer } from './useLiveConnection';

setupDeciNumberSnapshotSerializer();

it('can push a new table into the computer', async () => {
  // We need a first request for the computer to function
  const computer = getRemoteComputer({ initialProgram: [] });

  const { type, value } = await runCode(
    'Table1 = { Column1 = [1], Column2 = [2] }\nTable1'
  );

  await pushResultToComputer(
    computer,
    'blockid',
    'Table1',
    serializeResult(type, value)
  );

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
    Array [
      Array [
        "blockid",
        Array [
          Array [
            DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 1n,
              "s": 1n,
            },
          ],
          Array [
            DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 2n,
              "s": 1n,
            },
          ],
        ],
      ],
      Array [
        "blockid--0",
        Array [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 1n,
            "s": 1n,
          },
        ],
      ],
      Array [
        "blockid--1",
        Array [
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

  // Garbage collect
  await pushResultToComputer(computer, 'blockid', 'Table1', undefined);

  // Assert on the computer's internal state to make sure we've GC'd the things we need to
  expect(await computer.getExternalData()).toEqual(new Map());
});
