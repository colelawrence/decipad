import { Stack } from './index';

const value = 'value';

it('can push and pop contexts', () => {
  const stack = new Stack();

  stack.push();

  stack.set('variable', value);
  expect(stack.get('variable')).toEqual(value);

  stack.pop();

  expect(stack.has('variable')).toEqual(false);
});

it('throws when making the stack empty with pop()', () => {
  const stack = new Stack();

  stack.push(); // Length 2
  stack.pop(); // Length 1
  expect(() => stack.pop()).toThrow(); // I'm sorry Dave, I'm afraid I can't do that
});

it('throws when getting an undefined variable', () => {
  const stack = new Stack();
  expect(() => stack.get('variable')).toThrow(); // variable only existed before pop()
});

it('checks for the presence of a variable', () => {
  const stack = new Stack([['GlobalScope', 1]]);

  stack.push([['InnerScope', 2]]);

  expect(stack.has('InnerScope')).toEqual(true);
  expect(stack.has('GlobalScope')).toEqual(true);
  expect(stack.has('MissingVar')).toEqual(false);
});

it('wraps a context', () => {
  const stack = new Stack();

  expect(stack.stack.length).toEqual(1);

  stack.withPush(() => {
    expect(stack.stack.length).toEqual(2);
  });

  expect(stack.has('variable')).toEqual(false);
});
