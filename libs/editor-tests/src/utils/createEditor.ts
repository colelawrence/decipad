import { MyEditor } from '@decipad/editor-types';
import { createPlateEditor } from '@udecode/plate';
import { plugins } from '@decipad/editor';
import { Computer } from '@decipad/computer';
import { getDefined } from '@decipad/utils';
import { Subject } from 'rxjs';
import { UserInteraction } from '@decipad/react-contexts';
import { loadDoc } from './loadDoc';

export const createEditor = (
  docPath?: string
): { editor: MyEditor; computer: Computer } => {
  const computer = new Computer();
  const interactions = new Subject<UserInteraction>();
  const readOnly = false;

  const editor = createPlateEditor({
    plugins: plugins({ computer, readOnly, interactions }),
  });
  editor.children = getDefined(
    (docPath != null && loadDoc(docPath).children) || undefined
  );
  return { editor, computer };
};
