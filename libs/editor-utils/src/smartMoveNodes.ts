import { Path } from 'slate';
import type { TEditor } from '@udecode/plate-common';
import {
  createPathRef,
  moveNodes,
  withoutNormalizing,
} from '@udecode/plate-common';

/**
 * Wrapper around moveNodes that accounts for direction and the sibling issue.
 *
 * Sibling issue: When the fromPath and toPath are sibling paths and toPath
 * comes after fromPath, toPath needs to be decremented to account for the node
 * at fromPath being removed.
 *
 * Returns false if no move occurred. Otherwise, returns true.
 */
export const smartMoveNode = (
  editor: TEditor,
  fromPath: Path,
  toPath: Path,
  direction: 'before' | 'after'
): boolean => {
  let adjustedToPath = toPath;

  // Account for direction
  if (direction === 'after') {
    adjustedToPath = Path.next(adjustedToPath);
  }

  // Account for sibling issue
  if (
    Path.isSibling(adjustedToPath, fromPath) &&
    Path.isAfter(adjustedToPath, fromPath)
  ) {
    adjustedToPath = Path.previous(adjustedToPath);
  }

  // If the paths are the same, no need to move.
  if (Path.equals(fromPath, adjustedToPath)) {
    return false;
  }

  moveNodes(editor, {
    at: fromPath,
    to: adjustedToPath,
  });

  return true;
};

/**
 * For each node in fromPaths, move that node before/after the previously moved
 * node, or before/after toPath in the case of the first moved node. If moving
 * before, do this in reverse order to avoid reversing the moved nodes. I
 * promise it makes sense; if you don't believe me, print out some numbered
 * cards and follow the algorithm by hand.
 *
 * One limitation of this approach is that in some circumstances, operations
 * will be performed even if the end result is exactly the same as when we
 * started. In case this becomes an issue, here's a plan for fixing it:
 *
 * 1. Operations are inevitable if the selected blocks are non-contiguous,
 * since they'll become contiguous after the move. Check if the selection is
 * non-contiguous (this is a non-trivial task), and if so, proceed with the
 * move regardless of the toPath.
 * 2. Otherwise, we know that the selected range is contiguous. Get the paths
 * of the first selected block and the last selected block. If the toPath
 * falls within this range (inclusive), then we can skip the move since the
 * result will be unchanged.
 *
 * To check if a list of paths is contiguous:
 *
 * 1. Contiguousness is only concerned with the highest level paths. Find the
 * minimum length of any path and get the list of all paths with that length.
 * 2. For a list of paths to be contiguous, all highest level paths must be
 * siblings. Take the first path in the list and use Path.isSibling to check
 * if all other paths are siblings of it. If any aren't, return false.
 * 3. The list of sibling paths is contiguous if and only if the difference
 * between the first and last sibling paths is equal to the number of sibling
 * paths minus one.
 *   lastPath.at(-1) - firstPath.at(-1) === siblingPaths.length - 1
 */
export const smartMoveNodes = (
  editor: TEditor,
  fromPaths: Path[],
  toPath: Path,
  direction: 'before' | 'after'
) => {
  /**
   * We expect fromPaths to be in order. Just in case they're not, sort them,
   * reversing the order if the direction is before.
   */
  const sortedFromPaths = fromPaths.sort(
    (a, b) => Path.compare(a, b) * (direction === 'before' ? -1 : 1)
  );

  /**
   * Using path refs lets us forget about incrementing and decrementing paths
   * when nodes are moved.
   */
  const fromPathRefs = sortedFromPaths.map((path) =>
    createPathRef(editor, path)
  );

  let adjustedToPath = toPath;

  withoutNormalizing(editor, () => {
    fromPathRefs.forEach((fromPathRef) => {
      smartMoveNode(editor, fromPathRef.current!, adjustedToPath, direction);

      // The next fromPath is moved relative to the one we just moved
      adjustedToPath = fromPathRef.unref()!;
    });
  });
};
