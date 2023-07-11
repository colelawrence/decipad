import { dndStore } from './useDnd';
import { validFileType } from './validateItemAndGetFile';

export const canDropFile = (data: DataTransfer) => {
  const items = data.items || [];
  return Array.from(items).some((item) => {
    try {
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file && validFileType(item.type)) {
          dndStore.set.canDrop(true);
          return true;
        }
      }
    } catch {
      // do nothing
    }
    dndStore.set.canDrop(false);
    return false;
  });
};
