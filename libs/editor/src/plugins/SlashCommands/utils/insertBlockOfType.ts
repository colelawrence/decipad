import { SPEditor, TDescendant, setNodes } from '@udecode/plate';
import type { ElementType } from '../../../utils/elementTypes';

export const insertBlockOfType =
  (type: ElementType) =>
  (editor: SPEditor): void => {
    setNodes<TDescendant>(editor, { type });
  };
