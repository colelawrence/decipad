import { Element } from './types';

type TEl<TElement> = Omit<Element<TElement>, 'children'>;
type TempEl<TElement> = TEl<TElement> & {
  children?: Element<TElement>['children'];
};

export const stripChildren = <TE>(
  nodes: Array<Element<TE>>
): Array<TEl<TE>> => {
  return nodes.map((_node) => {
    const node = {
      ..._node,
    } as TempEl<TE>;
    if ('children' in node) {
      // eslint-disable-next-line no-param-reassign
      delete node.children;
    }
    if ('tempChildren' in node) {
      // eslint-disable-next-line no-param-reassign
      delete node.tempChildren;
    }
    return node as TEl<TE>;
  });
};
