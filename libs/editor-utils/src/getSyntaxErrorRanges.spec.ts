import type { Parser } from '@decipad/computer';
import { DECORATE_SYNTAX_ERROR } from '@decipad/editor-types';
import { getSyntaxErrorRanges } from './getSyntaxErrorRanges';

const path = [0];
const offset = 10;

it('should return no range when there is no syntax error', () => {
  expect(getSyntaxErrorRanges(path, undefined)).toEqual([]);
});

it('should return no range for invalid error constructs', () => {
  expect(getSyntaxErrorRanges(path, { message: 'some error' })).toEqual([]);
  expect(
    getSyntaxErrorRanges(path, {
      bracketError: { open: {} },
    } as never as Parser.ParserError)
  ).toEqual([]);
});

describe('when it is a syntax error', () => {
  it('should return a range', () => {
    expect(
      getSyntaxErrorRanges(path, {
        blockId: '123',
        message: 'some error',
        token: { offset },
      } as never as Parser.ParserError)
    ).toEqual([
      {
        anchor: { offset, path },
        focus: { offset: offset + 1, path },
        [DECORATE_SYNTAX_ERROR]: true,
      },
    ]);
  });
});

describe('when it is a bracket error', () => {
  it('should return two ranges for a mismatched-brackets error', () => {
    const offset2 = offset * 2;
    expect(
      getSyntaxErrorRanges(path, {
        blockId: '123',
        message: 'some error',
        bracketError: {
          type: 'mismatched-brackets',
          close: { offset: offset2 },
          open: { offset },
        },
      } as never as Parser.ParserError)
    ).toEqual([
      {
        anchor: { offset, path },
        focus: { offset: offset + 1, path },
        [DECORATE_SYNTAX_ERROR]: true,
        variant: 'mismatched-brackets',
      },
      {
        anchor: { offset: offset2, path },
        focus: { offset: offset2 + 1, path },
        [DECORATE_SYNTAX_ERROR]: true,
        variant: 'mismatched-brackets',
      },
    ]);
  });

  it.each([
    ['never-closed', 'open'],
    ['never-opened', 'close'],
  ])('should return a range for a %s error', (variant, errorProp) => {
    expect(
      getSyntaxErrorRanges(path, {
        blockId: '123',
        message: 'some error',
        bracketError: {
          type: variant,
          [errorProp]: { offset },
        },
      } as never as Parser.ParserError)
    ).toEqual([
      {
        anchor: { offset, path },
        focus: { offset: offset + 1, path },
        [DECORATE_SYNTAX_ERROR]: true,
        variant,
      },
    ]);
  });
});
