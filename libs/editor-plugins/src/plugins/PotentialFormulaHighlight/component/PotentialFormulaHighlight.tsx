import { getExprRef } from '@decipad/computer';
import {
  CodeLineElement,
  ELEMENT_INLINE_NUMBER,
  ELEMENT_CODE_LINE,
  ELEMENT_PARAGRAPH,
  PlateComponent,
  RichText,
  useTEditorRef,
  InlineNumberElement,
  MyEditor,
  MARK_MAGICNUMBER,
} from '@decipad/editor-types';
import { getAboveNodeSafe, isElementOfType } from '@decipad/editor-utils';
import { PotentialFormulaHighlight as UIPotentialFormulaHighlight } from '@decipad/ui';
import { noop } from '@decipad/utils';
import {
  findNodePath,
  getEndPoint,
  getNodeString,
  insertNodes,
} from '@udecode/plate';
import { nanoid } from 'nanoid';
import { useCallback, useEffect } from 'react';
import { BaseRange, Path, Point } from 'slate';

import type { PotentialFormulaDecoration } from '../decorate/interface';
import { useIsPotentialFormulaSelected } from './useIsPotentialFormulaSelected';

export const PotentialFormulaHighlight: PlateComponent<{
  leaf: PotentialFormulaDecoration & RichText;
}> = ({ attributes, children, text, leaf }) => {
  const editor = useTEditorRef();
  const selected = useIsPotentialFormulaSelected(editor, leaf);

  const onCommit = useCallback(() => {
    const path = text && findNodePath(editor, text);

    if (!path || !leaf?.location) {
      return;
    }

    // FIXME: Opt out to use inline numbers in ENG-1293
    commitPotentialFormula(editor, path, leaf, 'magic');
  }, [editor, text, leaf]);

  useEffect(() => {
    if (!selected) {
      return noop;
    }

    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === 'Tab') {
        ev.preventDefault();
        ev.stopPropagation();
        onCommit();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
    };
  }, [selected, onCommit]);

  return (
    <UIPotentialFormulaHighlight
      attributes={attributes}
      onCommit={onCommit}
      tooltipOpen={selected}
    >
      {children}
    </UIPotentialFormulaHighlight>
  );
};

export const commitPotentialFormula = (
  editor: MyEditor,
  path: Path,
  leaf: RichText & PotentialFormulaDecoration,
  mode: 'magic' | 'inline',
  id = nanoid()
) => {
  const insertionPath = getAboveNodeSafe(editor as MyEditor, {
    at: path,
    match: (x) => isElementOfType(x, ELEMENT_PARAGRAPH),
  });

  if (!insertionPath) return;

  const codeLineBelow: CodeLineElement = {
    type: ELEMENT_CODE_LINE,
    id,
    children: [{ text: getNodeString(leaf as RichText) }],
  };

  const magicNumberInstead = {
    [MARK_MAGICNUMBER]: true,
    text: getExprRef(id),
  };

  const inlineNumberInstead: InlineNumberElement = {
    type: ELEMENT_INLINE_NUMBER,
    id: nanoid(),
    blockId: id,
    children: [{ text: '' }],
  };

  const viewInstead =
    mode === 'inline' ? inlineNumberInstead : magicNumberInstead;

  const expressionRange: BaseRange = {
    anchor: { path, offset: leaf.location.anchor },
    focus: { path, offset: leaf.location.focus },
  };

  insertNodes(editor, viewInstead, {
    voids: true,
    at: expressionRange,
  });

  const currentBlockEnd: Point = getEndPoint(editor, [path[0]]);

  insertNodes(editor, codeLineBelow, { at: currentBlockEnd });
};
