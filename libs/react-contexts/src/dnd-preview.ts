import { createStore } from '@udecode/plate-common';

export const dndPreviewStore = createStore('dndPreview')({
  previewText: '',
  draggingId: '' as string,
});

export const useDndPreviewSelectors = () => dndPreviewStore.use;
export const dndPreviewSelectors = dndPreviewStore.get;
export const dndPreviewActions = dndPreviewStore.set;
