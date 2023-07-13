export const getEmptyImage = (): HTMLImageElement | null => {
  return typeof document === 'undefined' ? null : document.createElement('img');
};
