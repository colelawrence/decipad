import { SubscriptionPlan } from '@decipad/editor-types';
import { dndStore } from './useDnd';
import { validateItemAndGetFile } from './validateItemAndGetFile';

export const canDropFile = (data: DataTransfer, plan: SubscriptionPlan) => {
  const items = data.items || [];

  return Array.from(items).some((item) => {
    try {
      if (validateItemAndGetFile(item, plan)) {
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
