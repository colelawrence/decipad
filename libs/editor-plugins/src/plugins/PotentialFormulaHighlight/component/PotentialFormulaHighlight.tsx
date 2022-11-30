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
  toDOMNode,
} from '@udecode/plate';
import { nanoid } from 'nanoid';
import { useCallback, useEffect } from 'react';
import { BaseRange, Path, Point } from 'slate';
import { getExprRef } from '@decipad/computer';
import { useEditorBubblesContext } from '@decipad/react-contexts';
import { isFlagEnabled } from '@decipad/feature-flags';
import type { PotentialFormulaDecoration } from '../decorate/interface';
import { useIsPotentialFormulaSelected } from './useIsPotentialFormulaSelected';

export const PotentialFormulaHighlight: PlateComponent<{
  leaf: PotentialFormulaDecoration & RichText;
}> = ({ attributes, children, text, leaf }) => {
  const editor = useTEditorRef();
  const selected = useIsPotentialFormulaSelected(editor, leaf);

  const { openEditor } = useEditorBubblesContext();

  const onCommit = useCallback(() => {
    const path = text && findNodePath(editor, text);

    if (!path || !leaf?.location) {
      return;
    }

    const afterCommit = isFlagEnabled('SHADOW_CODE_LINES') ? openEditor : noop;

    // FIXME: Opt out to use inline numbers in ENG-1401
    commitPotentialFormula(editor, path, leaf, 'magic', afterCommit);
  }, [editor, text, leaf, openEditor]);

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
  onCommit: (ref: { codeLineId: string; numberId: string }) => void,
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
    isUnpinned: isFlagEnabled('SHADOW_CODE_LINES'),
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

  setTimeout(() => {
    const domNode = toDOMNode(editor, magicNumberInstead);
    const dataNode = domNode?.querySelector<HTMLElement>('[data-number-id]');
    const numberId = dataNode?.dataset.numberId;

    if (!numberId) return;

    onCommit({
      numberId,
      codeLineId: codeLineBelow.id,
    });
  }, 100);
};
