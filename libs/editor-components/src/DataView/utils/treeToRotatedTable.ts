import { getDefined } from '@decipad/utils';
import type { Element } from './types';

const calculateHeight = <TElement>(node: Element<TElement>): number => {
  if (!node.children.length) {
    return 1;
  }
  return 1 + Math.max(...node.children.map(calculateHeight));
};

const fillColSpans = <TElement>(node: Element<TElement>): Element<TElement> => {
  const children = node.children.map(fillColSpans);
  const colSpan =
    children.length < 1
      ? 1
      : children.reduce((cSpan, child) => getDefined(child.colspan) + cSpan, 0);
  return {
    ...node,
    colspan: colSpan,
    children,
  };
};

const fillRowSpans = <TElement>(
  node: Element<TElement>,
  height: number
): Element<TElement> => {
  const rowSpan = node.children.length < 1 ? height : 1;
  return {
    ...node,
    rowspan: rowSpan,
    children: node.children.map((child) => fillRowSpans(child, height - 1)),
  };
};

const toTable = <TElement>(
  _row: Element<TElement>[]
): Array<Element<TElement>>[] => {
  let row = _row;
  const rows = [row];
  while (row.some((cell) => cell.children.length > 0)) {
    row = row.map((cell) => cell.children).flat();
    rows.push(row);
  }
  return rows;
};

export const treeToRotatedTable = <TElement>(
  root: Element<TElement>
): Array<Element<TElement>>[] => {
  const height = calculateHeight(root);
  return toTable(fillRowSpans(fillColSpans(root), height).children).filter(
    (row) => row.length > 0
  );
};
