import { findNodePath, setNodes } from '@udecode/plate';
import { Subscription, debounceTime, filter } from 'rxjs';
import { useEffect, useState } from 'react';
import { useComputer } from '@decipad/react-contexts';
import { SmartRefElement, useTEditorRef } from '@decipad/editor-types';

const debounceTimeMs = 5_000;

// reinstate symbol name if found elsewhere on the notebook
export const useReinstateSmartRefBlockId = (element: SmartRefElement) => {
  const computer = useComputer();
  const editor = useTEditorRef();
  const [missingRef, setMissingRef] = useState(false);

  useEffect(() => {
    const undefinedSymbolName$ = computer.getSymbolOrTableDotColumn$
      .observe(element.blockId, element.columnId)
      .pipe(
        debounceTime(debounceTimeMs),
        filter((name) => !name)
      );

    const sub = undefinedSymbolName$.subscribe(
      (debouncedUndefinedSymbolName) => {
        if (debouncedUndefinedSymbolName == null) {
          // should always be true
          setMissingRef(true);
        }
      }
    );

    return () => sub.unsubscribe();
  }, [computer.getSymbolOrTableDotColumn$, element.blockId, element.columnId]);

  useEffect(() => {
    let sub: Subscription | undefined;
    const { lastSeenVariableName } = element;
    if (missingRef && lastSeenVariableName) {
      const doesThisVariableExist$ = computer.getVarBlockId$
        .observe(lastSeenVariableName)
        .pipe(filter((blockId) => !!blockId));
      sub = doesThisVariableExist$.subscribe((newBlockId) => {
        if (newBlockId) {
          const elPath = findNodePath(editor, element);
          if (elPath) {
            // eslint-disable-next-line no-console
            console.log(
              '>>>>>>>>>>>>>>> setting new reference to smart ref because the old one was missing'
            );
            setNodes(editor, { blockId: newBlockId }, { at: elPath });
            setMissingRef(false);
          }
        }
      });
    }
    return () => sub?.unsubscribe();
  }, [computer.getVarBlockId$, editor, element, missingRef]);
};
