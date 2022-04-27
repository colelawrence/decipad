import { Element, Path } from 'slate';
import { ReactEditor } from 'slate-react';
import { findPath } from './findPath';

type WithPathFunction = (path: Path) => void;

export const withPath = (
  editor: ReactEditor,
  element: Element,
  fn: WithPathFunction
): void => {
  const path = findPath(editor, element);
  if (path) {
    fn(path);
  }
};
