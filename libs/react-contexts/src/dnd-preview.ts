import { createZustandStore } from '@udecode/plate-common';

export const dndPreviewStore = createZustandStore('dndPreview')({
  previewText: '',
  draggingId: '' as string,
});

export const useDndPreviewSelectors = () => dndPreviewStore.use;
export const dndPreviewSelectors = dndPreviewStore.get;
export const dndPreviewActions = dndPreviewStore.set;
