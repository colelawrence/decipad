import { getExprRef } from '@decipad/computer';
import {
  CodeLineElement,
  MARK_MAGICNUMBER,
  ELEMENT_CODE_LINE,
  ELEMENT_PARAGRAPH,
  PlateComponent,
  RichText,
  useTEditorRef,
} from '@decipad/editor-types';
import { isElementOfType } from '@decipad/editor-utils';
import { PotentialFormulaHighlight as UIPotentialFormulaHighlight } from '@decipad/ui';
import { noop } from '@decipad/utils';
import { findNodePath, getNodeString, isCollapsed } from '@udecode/plate';
import { nanoid } from 'nanoid';
import { useCallback, useEffect } from 'react';
import { BaseEditor, Editor, Path, Transforms } from 'slate';
import { useSelected } from 'slate-react';
import type { PotentialFormulaDecoration } from '../decorate/interface';

export const PotentialFormulaHighlight: PlateComponent<{
  leaf: PotentialFormulaDecoration & RichText;
}> = ({ attributes, children, text, leaf }) => {
  const selected = useSelected();
  const editor = useTEditorRef();

  const onCommit = useCallback(() => {
    const path = text && findNodePath(editor, text);

    if (!path || !leaf?.location) {
      return;
    }

    commitPotentialFormula(editor as BaseEditor, path, leaf);
  }, [editor, text, leaf]);

  useEffect(() => {
    if (!selected) {
      return noop;
    }

    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === 'Tab' && isCollapsed(editor.selection)) {
        ev.preventDefault();
        ev.stopPropagation();
        onCommit();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
    };
  }, [editor, selected, onCommit]);

  return (
    <UIPotentialFormulaHighlight attributes={attributes} onCommit={onCommit}>
      {children}
    </UIPotentialFormulaHighlight>
  );
};

export const commitPotentialFormula = (
  editor: BaseEditor,
  path: Path,
  leaf: RichText & PotentialFormulaDecoration,
  id = nanoid()
) => {
  const codeLineBelow: CodeLineElement = {
    type: ELEMENT_CODE_LINE,
    id,
    children: [{ text: getNodeString(leaf as RichText) }],
  };
  const magicNumberInstead = {
    [MARK_MAGICNUMBER]: true,
    text: getExprRef(id),
  };

  const insertionPath = Editor.above(editor, {
    at: path,
    match: (x) => isElementOfType(x, ELEMENT_PARAGRAPH),
  });

  if (!insertionPath) return;

  Transforms.insertNodes(editor, [magicNumberInstead], {
    at: {
      anchor: { path, offset: leaf.location.anchor },
      focus: { path, offset: leaf.location.focus },
    },
  });
  Transforms.insertNodes(editor, [codeLineBelow], {
    at: Editor.end(editor, insertionPath[1]),
  });
};
