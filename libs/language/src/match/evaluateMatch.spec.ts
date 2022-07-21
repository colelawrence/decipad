import { runAST } from '..';
import { n, block, match, matchDef, F } from '../utils';

describe('evaluateMatch', () => {
  it('errors if no match matches', async () => {
    const m = match(
      matchDef(n('literal', 'boolean', false), n('literal', 'number', F(1)))
    );
    await expect(() => runAST(block(m))).rejects.toThrow();
  });

  it('returns first match', async () => {
    const m = match(
      matchDef(n('literal', 'boolean', false), n('literal', 'number', F(1))),
      matchDef(n('literal', 'boolean', true), n('literal', 'number', F(2)))
    );
    await expect((await runAST(block(m))).value).toEqual(F(2));
  });
});
