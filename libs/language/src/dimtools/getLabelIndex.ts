import type { ColumnLikeValue } from '../value';

/**
 * Turns an output index (IE an index in a Interpreter.Result array) into an index of a label
 *
 * ColumnLike values which transform the order or arity of indices supply an .indexToLabelIndex method
 */
export async function getLabelIndex(
  column: ColumnLikeValue,
  index: number
): Promise<number> {
  getPositive(index);

  if (column.indexToLabelIndex) {
    return getPositive(await column.indexToLabelIndex(index));
  }

  return index;
}

const getPositive = (index: number | null) => {
  if (index == null || index < 0) {
    throw new Error(`index not found ${index}`);
  } else {
    return index;
  }
};
