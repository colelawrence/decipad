import type { Path } from 'slate';
import { FIRST_TAB_INDEX } from '../constants';

/**
 * An old notebook will be: Array<H1, ...OtherElements>;
 *
 * Migrating a notebook, involves adding Title And Tab.
 * Mearning temporarily we have: [Title, DataTab, Tab, H1, ...OtherElements].
 *
 * Therefore, to check that an H1 is at the top of the old notebook,
 * we check its in the 2rd position (Starting from 0).
 */
export function isFirstOfOldNodes(path: Path): boolean {
  if (path.length === 0) return false;

  return path[0] === FIRST_TAB_INDEX + 1;
}
