import { DataGroup } from 'libs/editor-components/src/DataView/types';

export function getChildAtLevel(
  child: DataGroup,
  index: number,
  level: number
) {
  let currentChild = child;

  for (let i = 0; i < level; i++) {
    if (
      !currentChild ||
      !currentChild.children ||
      currentChild.children[index] === undefined
    ) {
      return undefined; // Return undefined if the child at the specified index doesn't exist
    }
    currentChild = currentChild.children[index];
  }

  return currentChild;
}
