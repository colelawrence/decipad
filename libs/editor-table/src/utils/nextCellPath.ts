import { Path } from 'slate';

export const nextCellPath = (
  path: Path,
  edge: 'top' | 'left' | 'bottom' | 'right'
): Path => {
  const vector: [number, number] = (() => {
    if (edge === 'top') return [-1, 0];
    if (edge === 'left') return [0, -1];
    if (edge === 'bottom') return [1, 0];
    if (edge === 'right') return [0, 1];
    return [0, 0];
  })();

  return [
    ...path.slice(0, path.length - 2),
    path[path.length - 2] + vector[0],
    path[path.length - 1] + vector[1],
  ];
};
