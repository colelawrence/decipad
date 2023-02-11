import { inferProgram } from '@decipad/language';
import { getVisibleVariables } from './getVisibleVariables';
import { testBlocks } from '../testUtils';

it('finds variables that are in the context', async () => {
  const program = testBlocks('MissingVar', 'A = 1', 'Table = { Col = Ref }');
  const inferContext = await inferProgram(program);

  expect(getVisibleVariables(program, 'block-2', inferContext))
    .toMatchInlineSnapshot(`
      Object {
        "global": Set {
          "exprRef_block_0",
          "exprRef_block_1",
          "A",
          "exprRef_block_2",
          "Table",
          "Table.Col",
        },
        "local": Set {
          "Col",
        },
      }
    `);
});
