import { Subject, Observable, Subscription, of } from 'rxjs';
import {
  distinctUntilChanged,
  delay,
  throttleTime,
  concatMap,
  map,
  raceWith,
  switchMap,
} from 'rxjs/operators';
import { produce } from 'immer';
import { isCollapsed } from '@udecode/slate-plugins';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { HistoryEditor } from 'slate-history';
import { Node, Editor, Range, Text } from 'slate';
import { ReactEditor } from 'slate-react';
import { dequal } from 'dequal';
import { PadEditor } from '@decipad/runtime';
import { ResultsContextValue } from '@decipad/ui';
import { RuntimeContext } from '../Contexts/Runtime';

interface IUseRuntimeEditor {
  padId: string;
  editor: ReactEditor | null;
  setValue: React.Dispatch<React.SetStateAction<Node[] | null>>;
}

export function offsetToLineNumber(codeText: string, offset: number) {
  const cumulativeSum = (
    (sum) => (value: number) =>
      (sum += value)
  )(0);

  const lines = codeText
    .split('\n')
    .map((line) => line.length)
    .map(cumulativeSum)
    .map((line, i) => line + i);

  let c = offset;
  let foundLine = lines.length + 1;
  lines.forEach((line: number) => {
    if (c > line) return;
    c -= line;
    foundLine--;
  });

  return foundLine;
}

// Will be removed if we start using our own state management
function ghostApply(editor: ReactEditor, applier: () => void) {
  Editor.withoutNormalizing(editor, () => {
    if (HistoryEditor.isHistoryEditor(editor)) {
      HistoryEditor.withoutSaving(editor, applier);
    } else {
      applier();
    }
  });
}

interface Evaluation {
  // Used as a deduplicate key in distinctUntilChanged
  sourceText?: string;
  blockId: string | null;
  foundLine?: number;
  result?: any; // ComputationResult is defined globally, so we can't import it
}

export const useEditor = ({ padId, editor, setValue }: IUseRuntimeEditor) => {
  const { runtime } = useContext(RuntimeContext);
  const [padEditor, setPadEditor] = useState<PadEditor | null>(null);
  const [results, setResults] = useState<ResultsContextValue>({});

  const [evaluationRequests] = useState(() => new Subject<Evaluation>());

  // Create a padEditor and stop it
  useEffect(() => {
    const padEditor = runtime?.startPadEditor(padId, true) ?? null;
    setPadEditor(padEditor);

    return () => {
      setPadEditor(null);
      padEditor?.stop();
    };
  }, [runtime, padId]);

  // Plug the padEditor and the editor
  useEffect(() => {
    let cancelled = false;
    let sub: Subscription;

    if (editor != null && padEditor != null) {
      const valueP = padEditor.isOnlyRemote()
        ? padEditor.getValueEventually()
        : Promise.resolve(padEditor.getValue());

      valueP.then((value) => {
        if (!cancelled) {
          sub = padEditor.slateOps().subscribe((ops) => {
            ghostApply(editor, () => {
              for (const op of ops) {
                editor.apply(op);
              }
            });
          });

          setValue(value);
        }
      });
    }

    return () => {
      sub?.unsubscribe();
      cancelled = true;
    };
  }, [editor, padEditor, setValue]);

  useEffect(() => {
    if (padEditor == null || editor == null) return;

    let cancelled = false;

    const cursorChangeObservable: Observable<string | null> =
      evaluationRequests.pipe(
        map(({ blockId }: Evaluation) => blockId),
        distinctUntilChanged()
      );

    // Subject that notifies others when the cursor moves from a block to another
    const cursorChangeSubject = new Subject<string | null>();
    cursorChangeObservable.subscribe(cursorChangeSubject);

    const changesObservable: Observable<Evaluation> = evaluationRequests.pipe(
      // Deduplicate requests -- moving the cursor is another onChange event
      distinctUntilChanged(dequal),
      // Release the event loop
      throttleTime(400, undefined, { leading: false, trailing: true }),
      // Each request gets evaluated. concatMap is used, in order to prevent
      // parallel computation
      concatMap(async (request: Evaluation) => {
        if (
          request.blockId != null &&
          request.foundLine != null &&
          !cancelled
        ) {
          const result = await padEditor.resultAt(
            request.blockId,
            request.foundLine
          );

          return { ...request, result };
        } else {
          return request;
        }
      }),
      // When the result is an error, delay it for a tiny bit.
      // And when the cursor moved to a new block, evaluate the previous instantly
      switchMap((request: Evaluation) => {
        const isError =
          request.result?.errors.length > 0 ||
          request.result?.type?.errorCause != null;

        if (isError) {
          return of(null).pipe(
            delay(2000),
            raceWith(cursorChangeSubject),
            map(() => request)
          );
        } else {
          return of(request);
        }
      })
    );

    const sub = changesObservable.subscribe(
      ({ blockId, result: newResult }: Evaluation) => {
        try {
          if (cancelled || !newResult || !blockId) return;

          for (const error of newResult.errors ?? []) {
            console.error(error);
          }

          setResults(
            produce((results) => {
              const currentResult = results[blockId];

              if (!dequal(currentResult, newResult)) {
                results[blockId] = newResult;
              }
            })
          );
        } catch (err) {
          console.error(err);
        }
      }
    );

    return () => {
      cancelled = true;
      sub.unsubscribe();
      cursorChangeSubject.unsubscribe();
    };
  }, [evaluationRequests, editor, padEditor, runtime]);

  const onChangeLanguage = useCallback(() => {
    if (editor == null || padEditor == null) {
      return;
    }

    const ops = editor.operations;
    if (ops && ops.length && padEditor) {
      padEditor.sendSlateOperations(ops);
    }

    const { selection } = editor;

    if (selection && isCollapsed(selection)) {
      const cursor = Range.start(selection);

      const [parentNode] = Editor.parent(editor, cursor) as any;

      const isCodeBlock = parentNode.type === 'code_block';

      if (isCodeBlock) {
        const [node] = Editor.node(editor, cursor);

        if (!Text.isText(node)) {
          return;
        }

        const foundLine = offsetToLineNumber(node.text, cursor.offset);

        evaluationRequests.next({
          sourceText: node.text,
          blockId: parentNode.id as string,
          foundLine,
        });
      } else {
        // We want to know the cursor left any block
        evaluationRequests.next({ blockId: null });
      }
    }
  }, [editor, padEditor, evaluationRequests]);

  return { onChangeLanguage, results };
};
