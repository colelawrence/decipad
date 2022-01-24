import { codeBlockToCode } from './codeBlockToCode';
import { codeLine } from './testUtils';

describe('blockChildrenToCode', () => {
  it('works on no children', () => {
    expect(codeBlockToCode({ type: 'code_block', children: [] })).toBe('');
  });

  it('works on one child with one empty text node', () => {
    expect(
      codeBlockToCode({
        type: 'code_block',
        children: [
          {
            type: 'code_line',
            children: [{ text: '' }],
          },
        ],
      })
    ).toBe('');
  });

  it('concatenates multiple incomplete code_line nodes into different lines', () => {
    expect(
      codeBlockToCode({
        type: 'code_block',
        children: [
          codeLine('a = 1'),
          codeLine('t = {'),
          codeLine(''),
          codeLine('}'),
          codeLine('b = 2'),
        ],
      })
    ).toBe('a = 1\nt = {\n\n}\nb = 2');
  });
});
