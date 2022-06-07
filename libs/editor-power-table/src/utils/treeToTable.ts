/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { assertDefined } from '@decipad/utils';

/* eslint-disable no-param-reassign */
type BaseNode = {
  rowspan?: number;
  colspan?: number;
  depth?: number;
};

export type Element<TElement> = BaseNode &
  TElement & {
    children: Array<Element<TElement>>;
    tempChildren?: Array<Element<TElement>>;
  };

function hasChildren<TElement>(n: Element<TElement>): boolean {
  return n.children.length > 0;
}

function hasTempChildren<TElement>(n: Element<TElement>): boolean {
  return (n.tempChildren && n.tempChildren.length > 0) || false;
}

function traversalRowSpan<TElement>(
  tree: Element<TElement>
): Element<TElement> {
  if (!hasChildren(tree)) {
    return {
      ...tree,
      rowspan: 1,
      depth: 1,
      tempChildren: [],
    };
  }
  const res: Element<TElement> = {
    ...tree,
    rowspan: 0,
    depth: 0,
    tempChildren: [],
  };
  for (const node of tree.children) {
    const nSpan = traversalRowSpan(node);
    assertDefined(res.tempChildren);
    res.tempChildren.push(nSpan);
    res.rowspan = (res.rowspan || 0) + (nSpan.rowspan || 0);
    res.depth = Math.max(res.depth || 0, (nSpan.depth || 0) + 1);
  }
  return res;
}

function traversalColSpan<TElement>(
  tree: Element<TElement>,
  pDepth = 0
): Element<TElement> {
  if (!pDepth) {
    tree.colspan = 1;
  } else {
    tree.colspan = pDepth - (tree.depth || 0);
  }
  if (hasTempChildren(tree)) {
    tree.tempChildren?.forEach((child, index) => {
      assertDefined(tree.tempChildren);
      tree.tempChildren[index] = traversalColSpan(child, tree.depth || 0);
    });
  }
  return tree;
}

function traversalToTable<TElement>(
  root: Element<TElement>
): Array<Element<TElement>>[] {
  const res: Array<Element<TElement>[]> = [];
  const toArray = (tree: Element<TElement>, i: number, p = false) => {
    if (p) {
      for (let j = 0; j < (tree.rowspan || 0); j += 1) {
        const index = i + j;
        if (!res[index]) {
          res[index] = [];
        }
      }
      res[i].push(tree);
    }
    if (hasTempChildren(tree)) {
      assertDefined(tree.tempChildren);
      tree.tempChildren.forEach((child, q) => {
        toArray(child, i, true);
        assertDefined(tree.tempChildren);
        i += tree.tempChildren[q].rowspan || 0;
      });
    }
  };
  toArray(root, 0);
  return res;
}

export function treeToTable<TElement>(
  root: Element<TElement>
): Array<Element<TElement>>[] {
  return traversalToTable(traversalColSpan(traversalRowSpan(root)));
}
