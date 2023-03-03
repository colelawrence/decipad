import { dndStore } from './useDnd';
import { validateItemAndGetFile } from './validateItemAndGetFile';

export const canDropFile = (data: DataTransfer) => {
  const items = data.items || [];

  return Array.from(items).some((item) => {
    try {
      if (validateItemAndGetFile(item)) {
        dndStore.set.canDrop(true);
        return true;
      }
    } catch {
      // do nothing
    }
    dndStore.set.canDrop(false);
    return false;
  });
};
