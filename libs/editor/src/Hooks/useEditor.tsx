import { Subject, Observable, Subscription, pipe, of } from 'rxjs';
import {
  distinctUntilChanged,
  delay,
  switchScan,
  throttleTime,
  concatMap,
} from 'rxjs/operators';
import { PadEditor } from '@decipad/runtime';
import { isCollapsed } from '@udecode/slate-plugins';
import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
  useMemo,
} from 'react';
import { HistoryEditor } from 'slate-history';
import { Node, Editor, Range, Text, Transforms, Location } from 'slate';
import { ReactEditor } from 'slate-react';
import { dequal } from 'dequal';
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
  blockId: string;
  foundLine: number;
  result?: any; // ComputationResult is defined globally, so we can't import it
  // Location of the block to edit props of
  slateLocation: Location;
}

export const useEditor = ({ padId, editor, setValue }: IUseRuntimeEditor) => {
  const { runtime } = useContext(RuntimeContext);
  const [padEditor, setPadEditor] = useState<PadEditor | null>(null);

  const evaluationRequests = useMemo(() => new Subject<Evaluation>(), []);

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
      // Let's remove this once we have our own state management. Please!
      sub = padEditor.slateOps().subscribe((ops) => {
        ghostApply(editor, () => {
          for (const op of ops) {
            editor.apply(op);
          }
        });
      });

      const valueP = padEditor.isOnlyRemote()
        ? padEditor.getValueEventually()
        : Promise.resolve(padEditor.getValue());
      valueP.then((value) => {
        if (!cancelled) {
          setValue(value);

          ReactEditor.focus(editor as any);
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

    const observable: Observable<Evaluation> = pipe(
      // Deduplicate requests -- moving the cursor is another onChange event
      distinctUntilChanged(dequal),
      // Release the event loop
      delay(1),
      throttleTime(400, undefined, { leading: false, trailing: true }),
      // Each request gets evaluated. concatMap is used, in order to prevent
      // parallel computation
      concatMap(async (request: Evaluation) => {
        const result = await padEditor.resultAt(
          request.blockId,
          request.foundLine
        );

        return { ...request, result };
      }),
      // When the result is an error, delay it for a tiny bit.
      // And when the cursor moved to a new block, evaluate the previous instantly
      switchScan((prev: Evaluation, request: Evaluation) => {
        const isError =
          request.result?.errors.length > 0 ||
          request.result?.type?.errorCause != null;
        if (prev != null && prev.blockId !== request.blockId) {
          return of(prev, request);
        } else if (isError) {
          return of(request).pipe(delay(2000));
        } else {
          return of(request);
        }
      }, null as any)
    )(evaluationRequests);

    const sub = observable.subscribe(
      ({ blockId, result, slateLocation }: Evaluation) => {
        try {
          if (cancelled || !result) return;

          for (const error of result.errors ?? []) {
            console.error(error);
          }

          const [match] = Editor.nodes(editor, {
            at: slateLocation,
            match: (n: any) => n.id === blockId,
          });

          if (dequal(match?.[0].result, result)) {
            // Result already exists in the node, don't cause an update
            return;
          }

          Transforms.setNodes(
            editor,
            { result: match ? result ?? null : null },
            {
              at: slateLocation,
              match: (n) => Editor.isBlock(editor, n) && n.id === blockId,
            }
          );
        } catch (err) {
          console.error(err);
        }
      }
    );

    return () => {
      cancelled = true;
      sub.unsubscribe();
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

      const [parentNode, slateLocation] = Editor.parent(editor, cursor) as any;
      if (parentNode.type !== 'code_block') return;

      const [node] = Editor.node(editor, cursor);

      if (!Text.isText(node)) {
        return;
      }

      const foundLine = offsetToLineNumber(node.text, cursor.offset);

      evaluationRequests.next({
        slateLocation,
        sourceText: node.text,
        blockId: parentNode.id as string,
        foundLine,
      });
    }
  }, [editor, padEditor, evaluationRequests]);

  return { onChangeLanguage };
};
