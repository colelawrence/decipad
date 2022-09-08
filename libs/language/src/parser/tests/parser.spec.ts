import { SyntaxError } from '..';
import { parse } from '../parser';

it('includes the last token in "no solutions" errors', () => {
  const error = (() => {
    try {
      parse('100 &');
      return null;
    } catch (e) {
      return e as SyntaxError;
    }
  })();
  expect(error?.token?.offset).toEqual(4);
});
