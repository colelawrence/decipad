import { TDescendant } from '@udecode/plate';

/**
 * Get slate fragment from data transfer.
 */
export const getSlateFragment = (dataTransfer: DataTransfer) => {
  const data = dataTransfer.getData('application/x-slate-fragment');
  if (!data) return;

  const decoded = decodeURIComponent(window.atob(data));
  return JSON.parse(decoded) as TDescendant[];
};
