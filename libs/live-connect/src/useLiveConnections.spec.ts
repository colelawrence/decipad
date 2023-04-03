import { Computer, runCode, serializeResult } from '@decipad/computer';
import { timeout } from '@decipad/utils';
import { BehaviorSubject } from 'rxjs';
import { pushTableResultToComputer } from './useLiveConnection';

it('can push a new table into the computer', async () => {
  const computer = new Computer({ requestDebounceMs: 0 });
  // We need a first request for the computer to function
  computer.pushCompute({ program: [] });

  const { type, value } = await runCode(
    'Table1 = { Column1 = [1], Column2 = [2] }\nTable1'
  );

  pushTableResultToComputer(
    computer,
    'blockid',
    'Table1',
    serializeResult(type, value)
  );
  await timeout(0);

  expect(
    Array.from(Object.values(computer.results.value.blockResults), (result) => [
      result.id,
      result.result?.value,
    ])
  ).toMatchInlineSnapshot(`
    Array [
      Array [
        "blockid",
        Array [
          Array [
            DeciNumber(1),
          ],
          Array [
            DeciNumber(2),
          ],
        ],
      ],
      Array [
        "blockid--0",
        Array [
          DeciNumber(1),
        ],
      ],
      Array [
        "blockid--1",
        Array [
          DeciNumber(2),
        ],
      ],
    ]
  `);

  // Garbage collect
  pushTableResultToComputer(computer, 'blockid', 'Table1', undefined);
  await timeout(0);

  // Assert on the computer's internal state to make sure we've GC'd the things we need to
  expect(
    (computer as unknown as { externalData: BehaviorSubject<unknown> })
      .externalData.value
  ).toEqual(new Map());
  expect(
    (computer as unknown as { extraProgramBlocks: BehaviorSubject<unknown> })
      .extraProgramBlocks.value
  ).toEqual(new Map());
});
