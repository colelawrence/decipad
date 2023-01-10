import { N } from '@decipad/number';
import { runAST } from '..';
import { n, block, match, matchDef } from '../utils';

describe('evaluateMatch', () => {
  it('errors if no match matches', async () => {
    const m = match(
      matchDef(n('literal', 'boolean', false), n('literal', 'number', N(1)))
    );
    await expect(() => runAST(block(m))).rejects.toThrow();
  });

  it('returns first match', async () => {
    const m = match(
      matchDef(n('literal', 'boolean', false), n('literal', 'number', N(1))),
      matchDef(n('literal', 'boolean', true), n('literal', 'number', N(2)))
    );
    await expect((await runAST(block(m))).value).toEqual(N(2));
  });
});
