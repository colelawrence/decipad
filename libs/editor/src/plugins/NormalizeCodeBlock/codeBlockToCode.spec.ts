import { CodeLineElement } from '../../utils/elements';
import { codeBlockToCode } from './codeBlockToCode';

const codeLine = (text: string): CodeLineElement => ({
  type: 'code_line',
  children: [{ text }],
});

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

  it('concatenates multiple text nodes into one', () => {
    expect(
      codeBlockToCode({
        type: 'code_block',
        children: [
          {
            type: 'code_line',
            children: [{ text: 'a = ' }, { text: '1' }],
          },
        ],
      })
    ).toBe('a = 1');
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
