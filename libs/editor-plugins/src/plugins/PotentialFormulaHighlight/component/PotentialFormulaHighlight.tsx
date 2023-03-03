import { ClientEventsContext } from '@decipad/client-events';
import { Computer, getExprRef } from '@decipad/computer';
import {
  ELEMENT_INLINE_NUMBER,
  ELEMENT_PARAGRAPH,
  InlineNumberElement,
  MARK_MAGICNUMBER,
  MyEditor,
  PlateComponent,
  RichText,
  useTEditorRef,
} from '@decipad/editor-types';
import {
  createStructuredCodeLine,
  getAboveNodeSafe,
  insertNodes,
  isElementOfType,
} from '@decipad/editor-utils';
import {
  ShadowCalcReference,
  useComputer,
  useEditorTeleportContext,
} from '@decipad/react-contexts';
import { PotentialFormulaHighlight as UIPotentialFormulaHighlight } from '@decipad/ui';
import { noop } from '@decipad/utils';
import {
  findNodePath,
  getEndPoint,
  getNodeString,
  toDOMNode,
} from '@udecode/plate';
import { nanoid } from 'nanoid';
import { useCallback, useContext, useEffect } from 'react';
import { BaseRange, Path, Point } from 'slate';
import type { PotentialFormulaDecoration } from '../decorate/interface';
import { useIsPotentialFormulaSelected } from './useIsPotentialFormulaSelected';

export const PotentialFormulaHighlight: PlateComponent<{
  leaf: PotentialFormulaDecoration & RichText;
}> = ({ attributes, children, text, leaf }) => {
  const editor = useTEditorRef();
  const computer = useComputer();
  const selected = useIsPotentialFormulaSelected(editor, leaf);

  const { openEditor } = useEditorTeleportContext();
  const clientEvent = useContext(ClientEventsContext);

  const onCommit = useCallback(() => {
    const path = text && findNodePath(editor, text);

    if (!path || !leaf?.location) {
      return;
    }

    const afterCommit = openEditor;

    // FIXME: Opt out to use inline numbers in ENG-1401
    commitPotentialFormula(editor, computer, path, leaf, 'magic', afterCommit);

    clientEvent({
      type: 'action',
      action: 'number converted to code line',
    });
  }, [editor, text, leaf, clientEvent, computer, openEditor]);

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
  computer: Computer,
  path: Path,
  leaf: RichText & PotentialFormulaDecoration,
  mode: 'magic' | 'inline',
  onCommit: (ref: ShadowCalcReference) => void,
  id?: string
) => {
  const insertionPath = getAboveNodeSafe(editor as MyEditor, {
    at: path,
    match: (x) => isElementOfType(x, ELEMENT_PARAGRAPH),
  });

  if (!insertionPath) return;

  const codeLineBelow = createStructuredCodeLine({
    id,
    varName: computer.getAvailableIdentifier('Unnamed', 1),
    code: getNodeString(leaf as RichText),
  });

  const magicNumberInstead = {
    [MARK_MAGICNUMBER]: true,
    text: getExprRef(codeLineBelow.id),
  };

  const inlineNumberInstead: InlineNumberElement = {
    type: ELEMENT_INLINE_NUMBER,
    id: nanoid(),
    blockId: codeLineBelow.id,
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
      numberNode: magicNumberInstead,
      codeLineNode: codeLineBelow,
    });
  }, 100);
};
