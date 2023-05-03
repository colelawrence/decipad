// eslint-disable-next-line no-restricted-imports
import { getNodeEntry } from '@udecode/plate';

export const getNodeEntrySafe = (
  ...params: Parameters<typeof getNodeEntry>
): ReturnType<typeof getNodeEntry> | undefined => {
  try {
    return getNodeEntry(...params);
  } catch (err) {
    // do nothing
  }
  return undefined;
};
