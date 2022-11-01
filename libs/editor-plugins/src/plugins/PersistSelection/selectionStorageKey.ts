import { MyEditor } from '@decipad/editor-types';

export const selectionStorageKey = (editor: MyEditor): string =>
  `${editor.id}/selection`;
