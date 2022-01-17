import { Stack } from './index';

it('can push and pop contexts', async () => {
  const stack = new Stack();

  await stack.withPush(async () => {
    stack.top.set('variable', 1);
    expect(stack.get('variable')).toEqual(1);
  });

  expect(stack.get('variable')).toEqual(null);
});

it('can delete variables', async () => {
  const stack = new Stack();

  expect(() => stack.delete('missing')).toThrow();

  stack.set('someVar', 1);
  stack.delete('someVar');

  expect(stack.get('someVar')).toEqual(null);
});

it('checks for the presence of a variable', async () => {
  const stack = new Stack({ GlobalScope: 1 });

  await stack.withPush(async () => {
    stack.top.set('InnerScope', 2);

    expect(stack.has('InnerScope')).toEqual(true);
    expect(stack.has('GlobalScope')).toEqual(true);
    expect(stack.has('MissingVar')).toEqual(false);
  });
});

it('can push a function call', async () => {
  const stack = new Stack({ GlobalScope: 'GlobalScope' });

  await stack.withPush(async () => {
    stack.top.set('GlobalScope', 'garbage');
    stack.top.set('garbage', 'garbage');

    await stack.withPushCall(async () => {
      expect(stack.top).toEqual(new Map());

      expect(stack.get('GlobalScope')).toEqual('GlobalScope');
      expect(stack.get('garbage')).toEqual(null);
    });

    expect(stack.get('GlobalScope')).toEqual('garbage');
    expect(stack.get('garbage')).toEqual('garbage');
  });
});
