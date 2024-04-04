import type { SharedType } from '../model';
import type { Awareness } from 'y-protocols/awareness';
import type { MinimalRootEditor } from '@decipad/editor-types';

export type TYjsEditor<TEditor extends MinimalRootEditor> = TEditor & {
  editor: TEditor;
  sharedType: SharedType;
  destroy: () => void;
};

export type TCursorEditor<TEditor extends MinimalRootEditor> = TEditor & {
  awareness: Awareness;
  destroy: () => void;
};
