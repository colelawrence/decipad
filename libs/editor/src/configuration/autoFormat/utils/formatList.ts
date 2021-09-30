import { SPEditor, TEditor, toggleList } from '@udecode/plate';
import { format } from './format';

export const formatList = (editor: TEditor, elementType: string): void => {
  format(editor, () =>
    toggleList(editor as SPEditor, {
      type: elementType,
    })
  );
};
