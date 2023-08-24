import { applyUpdate, Doc } from 'yjs';

/**
 * checks if the initial state is that of a brand new notebook
 * Alternatively, initial state will be `AAA=` on new documents,
 * However this would make for rather unmaintanable code.
 */
export function isNewNotebook(initialState: string): boolean {
  if (initialState.length === 0) return false;

  const x = new Doc();
  const update = Buffer.from(initialState, 'base64');
  applyUpdate(x, update);
  return x.getArray().length === 0;
}
