import { mapValues } from 'lodash';
import { MultipleNodeProxy, MultipleNodeProxyProperties } from './types';

export const createMultipleNodeProxyFactory =
  <
    N,
    P extends object,
    A extends {
      [key in string]: (node: N, ...args: any[]) => void;
    }
  >({
    mapProperties,
    actions: actionsProp,
  }: {
    mapProperties: (node: N) => P;
    actions: A;
  }) =>
  (nodes: N[]) => {
    /**
     * The type variable A must have the same type as the actions option to
     * ensure that type inferrence works corectly. Hence, we need to transform
     * this type variable into the format that MultipleNodeProxy expects by
     * removing the `node: N` argument from each action.
     */
    type ProxyActions = {
      [key in keyof A]: A[key] extends (node: N, ...args: infer Args) => void
        ? (...args: Args) => void
        : never;
    };

    type Proxy = MultipleNodeProxy<N, P, ProxyActions>;

    /**
     * Get the mapped properties for each node in the MultipleNodeProxyProperty
     * format.
     */
    const nodeProperties = nodes
      .map(mapProperties)
      .map((props) =>
        mapValues(props, (value) => ({ value }))
      ) as MultipleNodeProxyProperties<P>[];

    /**
     * Reduce each set of properties into a single set of properties. Where all
     * values are the same, use that value. Otherwise, use 'varies'.
     */
    const properties: MultipleNodeProxyProperties<P> = nodeProperties.reduce(
      (acc, props) =>
        mapValues(acc, (accValue, key) => {
          const propsValue = props[key as keyof P];
          if (accValue === 'varies') return accValue;
          if (propsValue === 'varies') return propsValue;
          if (accValue.value !== propsValue.value) return 'varies';
          return accValue as any;
        })
    );

    /**
     * Transform the set of actions to remove the `node: N` argument. When an action
     * is called, it will be applied to all nodes simultaneously.
     */
    const actions = Object.fromEntries(
      Object.entries(actionsProp).map(([key, action]) => [
        key,
        (...args: any[]) => nodes.forEach((node) => action(node, ...args)),
      ])
    ) as ProxyActions;

    return { nodes, properties, actions } as Proxy;
  };
