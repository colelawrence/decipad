import { Stack, VarGroup } from './index';

it('can push and pop contexts', async () => {
  const stack = new Stack();

  await stack.withPush(async () => {
    stack.set('variable', 1);
    expect(stack.get('variable')).toEqual(1);
  });

  expect(stack.get('variable')).toEqual(null);
});

it('can delete variables', async () => {
  const stack = new Stack();

  stack.set('someVar', 1);
  stack.delete('someVar');

  expect(stack.get('someVar')).toEqual(null);
});

it('checks for the presence of a variable', async () => {
  const stack = new Stack({ GlobalScope: 1 });

  await stack.withPush(async () => {
    stack.set('InnerScope', 2);

    expect(stack.has('InnerScope')).toEqual(true);
    expect(stack.has('GlobalScope')).toEqual(true);
    expect(stack.has('MissingVar')).toEqual(false);
  });
});

it('can push a function call', async () => {
  const stack = new Stack({ GlobalScope: 'GlobalScope' });

  await stack.withPush(async () => {
    stack.set('GlobalScope', 'garbage');
    stack.set('garbage', 'garbage');

    await stack.withPushCall(async () => {
      expect(stack.get('GlobalScope')).toEqual('GlobalScope');
      expect(stack.get('garbage')).toEqual(null);
    });

    expect(stack.get('GlobalScope')).toEqual('garbage');
    expect(stack.get('garbage')).toEqual('garbage');
  });
});

describe('scope modifiers', () => {
  let stack: Stack<string>;
  beforeEach(() => {
    stack = new Stack();
  });

  const getHas = (name: string, place: VarGroup) => {
    const has = stack.has(name, place);
    const val = stack.get(name, place);

    // Existence should equal .has() return
    expect(has).toEqual(val != null);

    return val;
  };

  it('can have a duplicate variable at multiple scopes', async () => {
    stack.set('Duplicate', 'Global', 'global');

    expect(getHas('Duplicate', 'global')).toEqual('Global');
    expect(getHas('Duplicate', 'function')).toEqual('Global');
    expect(getHas('Duplicate', 'lexical')).toEqual('Global');

    await stack.withPush(async () => {
      stack.set('Duplicate', 'lexical', 'lexical');

      expect(getHas('Duplicate', 'global')).toEqual('Global');
      expect(getHas('Duplicate', 'function')).toEqual('Global');
      expect(getHas('Duplicate', 'lexical')).toEqual('lexical');
    });

    await stack.withPushCall(async () => {
      stack.set('Duplicate', 'Function', 'function');

      expect(getHas('Duplicate', 'global')).toEqual('Global');
      expect(getHas('Duplicate', 'function')).toEqual('Function');
      expect(getHas('Duplicate', 'lexical')).toEqual('Function');

      await stack.withPush(async () => {
        stack.set('Duplicate', 'lexical', 'lexical');

        expect(getHas('Duplicate', 'global')).toEqual('Global');
        expect(getHas('Duplicate', 'function')).toEqual('Function');
        expect(getHas('Duplicate', 'lexical')).toEqual('lexical');
      });
    });

    expect(getHas('Duplicate', 'global')).toEqual('Global');
    expect(getHas('Duplicate', 'function')).toEqual('Global');
    expect(getHas('Duplicate', 'lexical')).toEqual('Global');
  });

  it('can set variables into other scopes', async () => {
    await stack.withPushCall(async () => {
      await stack.withPush(async () => {
        stack.set('Global', 'Global', 'global');
        stack.set('Function', 'Function', 'function');
        stack.set('Lexical', 'Lexical', 'lexical');
      });

      expect(getHas('Lexical', 'lexical')).toEqual(null);
      expect(getHas('Function', 'lexical')).toEqual('Function');
      expect(getHas('Function', 'function')).toEqual('Function');
    });

    // Cleaned up
    expect(getHas('lexical', 'lexical')).toEqual(null);
    expect(getHas('Function', 'lexical')).toEqual(null);
    expect(getHas('Function', 'function')).toEqual(null);
  });
});
