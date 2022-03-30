import { AST } from '..';
import { inferProgram } from '../infer';
import { assign, block, l, r, tableDef } from '../utils';
import { getVisibleVariables } from './getVisibleVariables';

const blockWithId = (id: string, ...statements: AST.Statement[]) => {
  const blocc = block(...statements);
  blocc.id = id;
  return blocc;
};

it('finds variables that are in the context', async () => {
  const program = [
    blockWithId('1', r('MissingVar')),
    blockWithId('2', assign('A', l(1))),
    blockWithId(
      '3',
      tableDef('Table', {
        Col: r('Ref'),
      })
    ),
  ];
  const inferContext = await inferProgram(program);

  expect(getVisibleVariables(program, '3', inferContext))
    .toMatchInlineSnapshot(`
      Set {
        "A",
        "Table",
        "Col",
        "Table.Col",
      }
    `);
});
