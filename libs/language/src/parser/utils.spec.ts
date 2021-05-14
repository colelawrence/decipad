import { parse } from '.';
import { prettyPrintAST } from './utils';

it('can pretty print the AST', () => {
  expect(
    prettyPrintAST(
      parse([{ id: '1', source: 'A = 1 + 2\nB = [1, 2, 3]' }])[0].solutions[0]
    )
  ).toEqual(
    [
      '(block ',
      '  (assign ',
      '    (def A)',
      '    (+ 1 2))',
      '  (assign ',
      '    (def B)',
      '    (column 1 2 3)))',
    ].join('\n')
  );
});
