import { expect, describe, it, beforeEach } from 'vitest';
import { createMultipleNodeProxyFactory } from './createMultipleNodeProxyFactory';
import { MultipleNodeProxyProperty } from './types';

interface TestNode {
  name: string;
  color: 'red' | 'green' | 'blue';
  archived: boolean;
}

const createMultipleTestNodeProxy = createMultipleNodeProxyFactory({
  mapProperties: (node: TestNode) => ({
    mappedName: node.name,
    mappedColor: node.color,
    mappedArchived: node.archived,
  }),
  actions: {
    setColor: (node, color: TestNode['color']) => {
      // eslint-disable-next-line no-param-reassign
      node.color = color;
    },
  },
});

type MultipleTestNodeProxy = ReturnType<typeof createMultipleTestNodeProxy>;

let multipleTestNodeProxy: MultipleTestNodeProxy;

beforeEach(() => {
  multipleTestNodeProxy = createMultipleTestNodeProxy([
    {
      name: 'Node A',
      color: 'red',
      archived: false,
    },
    {
      name: 'Node B',
      color: 'red',
      archived: false,
    },
    {
      name: 'Node C',
      color: 'green',
      archived: false,
    },
  ]);
});

describe('createMultipleNodeProxyFactory', () => {
  it('amalgamates node properties', () => {
    expect(multipleTestNodeProxy.properties).toMatchObject({
      mappedName: 'varies',
      mappedColor: 'varies',
      mappedArchived: { value: false },
    });
  });

  it('applies actions to all nodes', () => {
    multipleTestNodeProxy.actions.setColor('blue');
    expect(multipleTestNodeProxy.nodes.map((node) => node.color)).toMatchObject(
      ['blue', 'blue', 'blue']
    );
  });

  // TypeScript tests
  /* eslint-disable */
  () => {
    // It has types for each mapped property
    multipleTestNodeProxy.properties
      .mappedName satisfies MultipleNodeProxyProperty<string>;
    multipleTestNodeProxy.properties
      .mappedColor satisfies MultipleNodeProxyProperty<
      'red' | 'green' | 'blue'
    >;
    multipleTestNodeProxy.properties
      .mappedArchived satisfies MultipleNodeProxyProperty<boolean>;

    // @ts-expect-error
    multipleTestNodeProxy.properties.mappedColor = { value: 'wrong' };

    // It does not have types for non-existent properties
    // @ts-expect-error
    multipleTestNodeProxy.properties.whatever;

    // It has types for each action
    // @ts-expect-error
    multipleTestNodeProxy.actions.setColor('wrong');

    // It does not have types for non-existent actions
    // @ts-expect-error
    multipleTestNodeProxy.actions.setWhatatever();
  };
  /* eslint-enable */
});
