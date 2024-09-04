import { expect, describe, it } from 'vitest';
import { N } from '@decipad/number';
// eslint-disable-next-line no-restricted-imports
import { n, block, match, matchDef } from '@decipad/language-utils';
import { runAST } from '..';

describe('evaluateMatch', () => {
  it('errors if no match matches', async () => {
    const m = match(
      matchDef(n('literal', 'boolean', false), n('literal', 'number', N(1)))
    );
    await expect(async () => runAST(block(m))).rejects.toThrow();
  });

  it('returns first match', async () => {
    const m = match(
      matchDef(n('literal', 'boolean', false), n('literal', 'number', N(1))),
      matchDef(n('literal', 'boolean', true), n('literal', 'number', N(2)))
    );
    expect((await runAST(block(m))).value).toEqual(N(2));
  });
});
