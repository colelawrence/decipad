import {
  findNode,
  findNodePath,
  isElement,
  setNodes,
} from '@udecode/plate-common';
import type { Subscription } from 'rxjs';
import { debounceTime, filter } from 'rxjs';
import { useEffect, useState } from 'react';
import type { SmartRefElement } from '@decipad/editor-types';
import { useMyEditorRef } from '@decipad/editor-types';
import { useComputer } from '@decipad/editor-hooks';

const debounceTimeMs = 5_000;

// reinstate symbol name if found elsewhere on the notebook
export const useReinstateSmartRefBlockId = (element: SmartRefElement) => {
  const computer = useComputer();
  const editor = useMyEditorRef();
  const [missingRef, setMissingRef] = useState(false);

  useEffect(() => {
    const undefinedSymbolName$ = computer.getSymbolOrTableDotColumn$
      .observe(element.blockId, element.columnId)
      .pipe(debounceTime(debounceTimeMs));

    const sub = undefinedSymbolName$.subscribe(
      (debouncedUndefinedSymbolName) => {
        setMissingRef(debouncedUndefinedSymbolName == null);
      }
    );

    return () => sub.unsubscribe();
  }, [computer.getSymbolOrTableDotColumn$, element.blockId, element.columnId]);

  useEffect(() => {
    let sub: Subscription | undefined;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const { lastSeenVariableName } = element;
    if (missingRef && lastSeenVariableName && element.blockId) {
      timeout = setTimeout(() => {
        const pointsTo = findNode(editor, {
          match: (node) => isElement(node) && node.id === element.blockId,
        });
        if (pointsTo) {
          // still exists, no need to reinstate
          return;
        }
        if (lastSeenVariableName.includes('.') || element.columnId) {
          // table column smart refs are complicated, and we are bound to make a mistake if we're going
          // to try to reinstate them. So we'll just skip them for now.
          return;
        }
        const doesThisVariableExist$ = computer.getVarBlockId$
          .observe(lastSeenVariableName)
          .pipe(filter((blockId) => !!blockId));
        sub = doesThisVariableExist$.subscribe((newBlockId) => {
          if (newBlockId && newBlockId !== element.blockId) {
            const elPath = findNodePath(editor, element);
            if (elPath) {
              // eslint-disable-next-line no-console
              console.log(
                `>>>>>>>>>>>>>>> ${lastSeenVariableName}: setting new reference of smart ref to new block id ${newBlockId} because the old one (${element.blockId}) was missing`
              );
              setNodes(editor, { blockId: newBlockId }, { at: elPath });
              setMissingRef(false);
            }
          }
        });
      }, debounceTimeMs);
    }
    return () => {
      sub?.unsubscribe();
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [computer.getVarBlockId$, editor, element, missingRef]);
};
