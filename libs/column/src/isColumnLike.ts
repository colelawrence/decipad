import { ColumnLike } from './ColumnLike';

export const isColumnLike = (thing: unknown): thing is ColumnLike<unknown> => {
  const col = thing as ColumnLike<unknown>;
  return typeof col === 'object' && typeof col?.atIndex === 'function';
};
