import { inferProgram } from '@decipad/language';
import { getDefined } from '@decipad/utils';
import { getVisibleVariables } from './getVisibleVariables';
import { testProgram } from '../testUtils';
import { programToComputerProgram } from '../utils/programToComputerProgram';

it('finds variables that are in the context', async () => {
  const program = programToComputerProgram(
    testProgram('MissingVar', 'A = 1', 'Table = { Col = Ref }')
  );
  const inferContext = await inferProgram(
    program.asSequence.map((b) => getDefined(b.block))
  );

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

it('finds variables visible in a table column assign', async () => {
  const program = programToComputerProgram(
    testProgram('Table = {}', 'Table.Col = 2', 'Table.Col2 = 2')
  );
  const inferContext = await inferProgram(
    program.asSequence.map((b) => getDefined(b.block))
  );

  expect(getVisibleVariables(program, 'block-1', inferContext))
    .toMatchInlineSnapshot(`
      Object {
        "global": Set {
          "exprRef_block_0",
          "Table",
          "Table.Col",
          "Table.Col2",
          "exprRef_block_1",
          "exprRef_block_2",
        },
        "local": Set {
          "Col",
          "Col2",
        },
      }
    `);
});
