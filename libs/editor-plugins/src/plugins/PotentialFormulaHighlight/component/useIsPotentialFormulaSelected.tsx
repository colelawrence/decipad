import { MyEditor } from '@decipad/editor-types';
import { EditorChangeContext } from '@decipad/react-contexts';
import { noop } from '@decipad/utils';
import { isCollapsed } from '@udecode/plate';
import { useContext, useEffect, useState } from 'react';
import { concat, of } from 'rxjs';
import { useSelected } from 'slate-react';
import type { PotentialFormulaDecoration } from '../decorate/interface';

/** Do we show the tooltip? */
export function useIsPotentialFormulaSelected(
  editor: MyEditor,
  decoration: PotentialFormulaDecoration
) {
  const editorChange$ = useContext(EditorChangeContext);
  const parentSelected = useSelected();

  const [selected, setSelected] = useState(false);

  // Sync editor.selection to `selected` but don't subscribe unless the paragraph is selected
  useEffect(() => {
    if (!parentSelected) {
      setSelected(false);
      return noop;
    }

    const sub = concat(of(undefined), editorChange$).subscribe(() => {
      setSelected(isPotentialFormulaSelected(editor, decoration));
    });
    return () => sub.unsubscribe();
  }, [editor, parentSelected, editorChange$, decoration]);

  // Close the tooltip if the user clicks-outside
  useEffect(() => {
    if (!selected) {
      return noop;
    }

    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') {
        setSelected(false);
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
    };
  }, [editor, parentSelected, editorChange$, selected, decoration]);

  return selected;
}

/** Decorations don't have a path!
 * we have to manually check cursor pos to see if we're selected */
function isPotentialFormulaSelected(
  editor: MyEditor,
  decoration: PotentialFormulaDecoration
) {
  const sel = isCollapsed(editor.selection) && editor.selection;

  if (sel) {
    const cursorPos = sel.anchor.offset;
    const { anchor: leafStart, focus: leafEnd } = decoration.location;

    return cursorPos >= leafStart && cursorPos <= leafEnd;
  }
  return false;
}
