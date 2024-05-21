import {
  getRemoteComputer,
  materializeOneResult,
  runCode,
  serializeResult,
} from '@decipad/remote-computer';
import { timeout } from '@decipad/utils';
import { setupDeciNumberSnapshotSerializer } from '@decipad/number';
import { pushResultToComputer } from './useLiveConnection';

setupDeciNumberSnapshotSerializer();

it('can push a new table into the computer', async () => {
  // We need a first request for the computer to function
  const computer = getRemoteComputer({ initialProgram: [] });

  const { type, value } = await runCode(
    'Table1 = { Column1 = [1], Column2 = [2] }\nTable1'
  );

  pushResultToComputer(
    computer,
    'blockid',
    'Table1',
    serializeResult(type, value)
  );
  await timeout(1000);

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

  // Garbage collect
  pushResultToComputer(computer, 'blockid', 'Table1', undefined);
  await timeout(1000);

  // Assert on the computer's internal state to make sure we've GC'd the things we need to
  expect(await computer.getExternalData()).toEqual(new Map());
  expect(await computer.getExtraProgramBlocks()).toEqual(new Map());
});
