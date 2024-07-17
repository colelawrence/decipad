import type { Computer } from '@decipad/computer-interfaces';
import { getExprRef } from '@decipad/remote-computer';
import { ClientEventsContext } from '@decipad/client-events';
import type {
  InlineNumberElement,
  MyEditor,
  PlateComponent,
  RichText,
} from '@decipad/editor-types';
import {
  ELEMENT_INLINE_NUMBER,
  ELEMENT_PARAGRAPH,
  MARK_MAGICNUMBER,
  useMyEditorRef,
} from '@decipad/editor-types';
import {
  createStructuredCodeLine,
  generateVarName,
  getAboveNodeSafe,
  insertNodes,
  isElementOfType,
  magicNumberId,
} from '@decipad/editor-utils';
import type { ShadowCalcReference } from '@decipad/react-contexts';
import { useEditorTeleportContext } from '@decipad/react-contexts';
import { PotentialFormulaHighlight as UIPotentialFormulaHighlight } from '@decipad/ui';
import { noop } from '@decipad/utils';
import {
  findNodePath,
  getEndPoint,
  getNodeString,
} from '@udecode/plate-common';
import { nanoid } from 'nanoid';
import { useCallback, useContext, useEffect } from 'react';
import type { BaseRange, Path, Point } from 'slate';
import type { PotentialFormulaDecoration } from '../decorate/interface';
import { useIsPotentialFormulaSelected } from './useIsPotentialFormulaSelected';
import { useComputer } from '@decipad/editor-hooks';

export const PotentialFormulaHighlight: PlateComponent<{
  leaf: PotentialFormulaDecoration & RichText;
}> = ({ attributes, children, text, leaf }) => {
  const editor = useMyEditorRef();
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
      segmentEvent: {
        type: 'action',
        action: 'number converted to code line',
      },
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
    varName: computer.getAvailableIdentifier(generateVarName()),
    code: getNodeString(leaf as RichText),
  });

  const magicNumberInstead = {
    [MARK_MAGICNUMBER]: true,
    text: getExprRef(codeLineBelow.id ?? ''),
  };

  const inlineNumberInstead: InlineNumberElement = {
    type: ELEMENT_INLINE_NUMBER,
    id: nanoid(),
    blockId: codeLineBelow.id ?? '',
    children: [{ text: '' }],
  };

  const viewInstead =
    mode === 'inline' ? inlineNumberInstead : magicNumberInstead;

  const expressionRange: BaseRange = {
    anchor: { path, offset: leaf.location.anchor },
    focus: { path, offset: leaf.location.focus },
  };

  insertNodes(editor, [viewInstead], {
    voids: true,
    at: expressionRange,
  });

  const currentBlockEnd: Point = getEndPoint(editor, [path[0]]);

  insertNodes(editor, [codeLineBelow], { at: currentBlockEnd });

  setTimeout(() => {
    const magicNumberParagraph = editor.children[path[0]];
    if (!magicNumberParagraph) return;
    const magicNumberIndex = magicNumberParagraph.children.findIndex(
      (c) => c.text === magicNumberInstead.text
    );
    if (magicNumberIndex === -1) return;
    const numberId = magicNumberId(magicNumberParagraph, magicNumberIndex);

    onCommit({
      numberId,
      codeLineId: codeLineBelow.id ?? '',
      numberNode: magicNumberInstead,
      codeLineNode: codeLineBelow,
    });
  }, 100);
};
