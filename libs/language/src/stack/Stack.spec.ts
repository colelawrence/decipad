import stringify from 'json-stringify-safe';
import { Stack, createStack } from './index';

let stack: Stack<string>;
beforeEach(() => {
  stack = createStack(
    undefined,
    (nsContents) => stringify([...nsContents]),
    (table) => {
      try {
        const names = JSON.parse(table);
        if (Array.isArray(names)) return new Map(names);
      } catch {
        return undefined;
      }
      return undefined;
    }
  );
});

it('can push and pop contexts', async () => {
  await stack.withPush(() => {
    stack.set('variable', '1');
    expect(stack.get('variable')).toEqual('1');
  });

  expect(stack.get('variable')).toEqual(null);
});

it('can check if names are global', async () => {
  stack.set('variable', '1');
  stack.set('globalVariable', '1');
  stack.setNamespaced(['Table', 'Column'], '1');

  await stack.withPush(() => {
    expect(stack.isNameGlobal(['', 'variable'])).toEqual(true);
    expect(stack.isNameGlobal(['', 'globalVariable'])).toEqual(true);
    expect(stack.isNameGlobal(['Table', 'Column'])).toEqual(true);
    expect(stack.isNameGlobal(['', 'Table'])).toEqual(true);

    stack.set('variable', '1');
    stack.setNamespaced(['Table', 'Column'], '1', 'lexical');

    expect(stack.isNameGlobal(['', 'variable'])).toEqual(false);
    expect(stack.isNameGlobal(['Table', 'Column'])).toEqual(false);
    expect(stack.isNameGlobal(['', 'Table'])).toEqual(false);
  });

  expect(stack.isNameGlobal(['', 'variable'])).toEqual(true);
  expect(stack.isNameGlobal(['', 'Table'])).toEqual(true);
});

it('can delete variables', () => {
  stack.set('someVar', '1');
  stack.delete('someVar');

  expect(stack.get('someVar')).toEqual(null);
});

it('checks for the presence of a variable', async () => {
  stack.set('GlobalScope', '1');
  await stack.withPush(() => {
    stack.set('InnerScope', '2');

    expect(stack.has('InnerScope')).toEqual(true);
    expect(stack.has('GlobalScope')).toEqual(true);
    expect(stack.has('MissingVar')).toEqual(false);
  });
});

it('can push a function call', async () => {
  stack.set('name', 'value1');

  await stack.withPush(async () => {
    stack.set('name', 'value2');

    await stack.withPush(() => {
      expect(stack.get('name')).toEqual('value2');
    });

    expect(stack.get('name')).toEqual('value2');
  });
  expect(stack.get('name')).toEqual('value1');
});

it('can use namespaces', () => {
  stack.setNamespaced(['Table', 'A'], 'AVal', 'global');
  stack.setNamespaced(['Table', 'B'], 'BVal', 'global');

  stack.setNamespaced(['OtherNs', 'A'], 'No', 'global');
  stack.set('A', 'No');

  expect(stack.get('Table')).toMatchInlineSnapshot(
    `"[[\\"A\\",\\"AVal\\"],[\\"B\\",\\"BVal\\"]]"`
  );
  expect(stack.has('Table')).toMatchInlineSnapshot(`true`);

  expect(stack.globalVariables).toMatchInlineSnapshot(`
    Map {
      "A" => "No",
      "Table" => "[[\\"A\\",\\"AVal\\"],[\\"B\\",\\"BVal\\"]]",
      "OtherNs" => "[[\\"A\\",\\"No\\"]]",
    }
  `);

  stack.set('TableToSplit', stringify([['ColName', '1']]));

  expect(stack.get('TableToSplit')).toMatchInlineSnapshot(
    `"[[\\"ColName\\",\\"1\\"]]"`
  );
  expect(
    stack.getNamespaced(['TableToSplit', 'ColName'])
  ).toMatchInlineSnapshot(`"1"`);
});

it('can expand an empty namespace', () => {
  stack.set('Table', stringify([]), 'global');
  expect(stack.get('Table')).toMatchInlineSnapshot(`"[]"`);
  expect(Object.fromEntries(stack.namespaces)).toMatchInlineSnapshot(`
    Object {
      "Table": Map {},
    }
  `);
});

describe('scope modifiers', () => {
  const getHas = (name: string) => {
    const has = stack.has(name);
    const val = stack.get(name);

    // Existence should equal .has() return
    expect(has).toEqual(val != null);

    return val;
  };

  it('can have a duplicate variable at multiple scopes', async () => {
    stack.set('Duplicate', 'Global', 'global');

    expect(getHas('Duplicate')).toEqual('Global');

    await stack.withPush(() => {
      stack.set('Duplicate', 'lexical', 'lexical');

      expect(getHas('Duplicate')).toEqual('lexical');
    });

    await stack.withPush(async () => {
      stack.set('Duplicate', 'Function', 'lexical');

      expect(getHas('Duplicate')).toEqual('Function');

      await stack.withPush(() => {
        stack.set('Duplicate', 'lexical', 'lexical');

        expect(getHas('Duplicate')).toEqual('lexical');
      });
    });

    expect(getHas('Duplicate')).toEqual('Global');
  });

  it('can set variables into other scopes', async () => {
    await stack.withPush(async () => {
      await stack.withPush(() => {
        stack.set('Global', 'Global', 'global');
        stack.set('Lexical', 'Lexical', 'lexical');
      });

      expect(getHas('Lexical')).toEqual(null);
      expect(getHas('Global')).toEqual(null);
    });

    // Cleaned up
    expect(getHas('lexical')).toEqual(null);
    expect(getHas('Function')).toEqual(null);
    expect(getHas('Function')).toEqual(null);
  });
});

describe('can set with an ID', () => {
  it('can set with ID', () => {
    stack.setNamespaced(['', 'A'], 'AVal', 'AId');
    stack.setNamespaced(['Table', 'B'], 'BVal', 'BId');

    expect(stack.get('A')).toEqual('AVal');
    expect(stack.get('Table')).toMatchInlineSnapshot(
      `"[[\\"B\\",\\"BVal\\"]]"`
    );
    expect(stack.getNamespaced(['Table', 'B'])).toEqual('BVal');
    expect(stack.get('AId')).toEqual('AVal');
    expect(stack.get('BId')).toEqual('BVal');

    stack.deleteNamespaced(['Table', 'B']);
    expect(stack.get('BId')).toEqual(null);
  });

  it('can set with ID in the context of a table', () => {
    stack.setNamespaced(['', 'Table'], stringify([['A', 'AVal']]), 'TableId');
    stack.setNamespaced(['Table', 'B'], 'ColumnVal', 'ColumnId');

    expect(stack.getNamespaced(['Table', 'A'])).toMatchInlineSnapshot(`"AVal"`);
    expect(stack.getNamespaced(['Table', 'B'])).toMatchInlineSnapshot(
      `"ColumnVal"`
    );
    expect(stack.get('Table')).toMatchInlineSnapshot(
      `"[[\\"A\\",\\"AVal\\"],[\\"B\\",\\"ColumnVal\\"]]"`
    );
  });

  it('can delete things with IDs', () => {
    stack.setNamespaced(['', 'A'], 'AVal', 'AId');
    stack.setNamespaced(['Table', 'B'], 'BVal', 'BId');

    stack.deleteNamespaced(['Table', 'B']);
    expect(stack.get('BId')).toEqual(null);

    stack.deleteNamespaced(['', 'A']);
    expect(stack.get('AId')).toEqual(null);
  });
});

it('has a weird namespace retriever for language tables', () => {
  const stack = createStack<string>(
    undefined,
    (nsContents) => stringify([...nsContents]),
    (table) => {
      try {
        const names = JSON.parse(table);
        if (Array.isArray(names)) return new Map(names);
      } catch {
        return undefined;
      }
      return undefined;
    },
    (namespacedThing) => `Hey I retrieved ${namespacedThing}`
  );

  stack.setNamespaced(['', 'A'], 'AVal', 'AId');
  stack.setNamespaced(['Table', 'B'], 'BVal', 'BId');

  expect(stack.get('A')).toEqual('AVal');
  expect(stack.getNamespaced(['Table', 'B'])).toMatchInlineSnapshot(
    `"Hey I retrieved BVal"`
  );
});
