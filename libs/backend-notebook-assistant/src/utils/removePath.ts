import { RootDocument } from '@decipad/editor-types';
// eslint-disable-next-line no-restricted-imports
import get from 'lodash.get';

export const removePath = (doc: RootDocument, path: string[]): void => {
  const lastPointStr = path[path.length - 1];
  const lastPoint = parseInt(lastPointStr, 10);
  if (Number.isNaN(lastPoint)) {
    throw new Error(
      `Expected last point to be a number and was ${lastPointStr}`
    );
  }
  const parent = get(doc, path.slice(0, -1));
  if (!Array.isArray(parent)) {
    throw new Error('Expected parent to be array');
  }
  parent.splice(lastPoint, 1);
};
