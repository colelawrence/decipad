/**
 * Represents an item block identifier.
 */
export type ItemBlockId = {
  identifier: string;
  blockId?: string;
  columnId?: string;
  explanation?: string;
};

/**
 * Checks if two item block identifiers match.
 *
 * @param a - The first item block identifier.
 * @param b - The second item block identifier (optional).
 * @returns A boolean indicating whether the item block identifiers match.
 */
export const matchItemBlocks = (
  a: ItemBlockId,
  b: ItemBlockId | undefined
): boolean => {
  // Check if both `a` and `b` have `blockId` properties
  if (a.blockId && b?.blockId) {
    // Check if either `a` or `b` have `columnId` properties
    if (a.columnId || b?.columnId) {
      // If both `a` and `b` have `columnId`, compare their values.
      // If there are identifiers, make sure they match as well
      return (
        a.columnId === b.columnId &&
        (!a?.identifier || !b?.identifier
          ? true
          : a.identifier === b.identifier)
      );
    }
    // If `a` and `b` have matching `blockId` properties, compare their values.
    // Also, compare the `identifier` and `explanation` properties
    // of `a` and `b` (if present).
    return (
      a.blockId === b.blockId &&
      (!a?.identifier || !b?.identifier
        ? true
        : a.identifier === b.identifier) &&
      (!a?.explanation || !b?.explanation
        ? true
        : a.explanation === b.explanation)
    );
  }
  // As a fallback, compare identifiers
  return a.identifier === b?.identifier;
};
