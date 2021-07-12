import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { produce } from 'immer';
import { isCollapsed } from '@udecode/slate-plugins';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { HistoryEditor } from 'slate-history';
import { Node, Editor, Range, Text } from 'slate';
import { dequal } from 'dequal';
import { captureException } from '@sentry/react';
import { PadEditor } from '@decipad/runtime';
import { makeResultsContextValue, ResultsContextValue } from '@decipad/ui';
import { ComputeRequest, makeComputer } from '@decipad/language';
import { RuntimeContext } from '../contexts/Runtime';

interface IUseRuntimeEditor {
  padId: string;
  editor: Editor | null;
  setValue: React.Dispatch<React.SetStateAction<Node[] | undefined>>;
}

interface SlateNode {
  type: string;
  children?: SlateNode[];
  text?: string;
  id: string;
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

type CursorPos = [string, number];

function getCursorPos(editor: Editor): CursorPos | null {
  const { selection } = editor;

  if (selection && isCollapsed(selection)) {
    const cursor = Range.start(selection);

    const [parentNode] = Editor.parent(editor, cursor) as any;
    const [node] = Editor.node(editor, cursor);

    const isCodeBlock = parentNode.type === 'code_block';

    if (isCodeBlock && Text.isText(node)) {
      const foundLine = offsetToLineNumber(node.text, cursor.offset);

      return [parentNode.id, foundLine];
    }
  }

  return null;
}

// Will be removed if we start using our own state management
function ghostApply(editor: Editor, applier: () => void) {
  Editor.withoutNormalizing(editor, () => {
    if (HistoryEditor.isHistoryEditor(editor)) {
      HistoryEditor.withoutSaving(editor, applier);
    } else {
      applier();
    }
  });
}

export const useEditor = ({ padId, editor, setValue }: IUseRuntimeEditor) => {
  const { runtime } = useContext(RuntimeContext);
  const [padEditor, setPadEditor] = useState<PadEditor | null>(null);
  const [results, setResults] = useState<ResultsContextValue>(
    makeResultsContextValue
  );

  const [evaluationRequests] = useState(
    () => new Subject<[ComputeRequest, CursorPos | null]>()
  );

  // Create a padEditor
  useEffect(() => {
    const padEditor = runtime?.startPadEditor(padId) ?? null;
    setPadEditor(padEditor);

    return () => {
      setPadEditor(null);
      padEditor?.stop();
    };
  }, [runtime, padId]);

  // Plug the padEditor and the editor
  useEffect(() => {
    let sub: Subscription;

    if (editor != null && padEditor != null) {
      sub = padEditor.slateOps().subscribe((ops) => {
        ghostApply(editor, () => {
          for (const op of ops) {
            editor.apply(op);
          }
        });
      });

      const value = padEditor.getValue();
      setValue(value);
    }

    return () => sub?.unsubscribe();
  }, [editor, padEditor, setValue]);

  // Get some computation results based on evaluation requests
  useEffect(() => {
    if (padEditor == null || editor == null) return;

    const sub = evaluationRequests
      .pipe(
        // Debounce to give React an easier time
        debounceTime(100),
        makeComputer()
      )
      // Catch all errors here
      .subscribe({
        next: ([res, cursor]) => {
          if (res.type === 'compute-panic') {
            setResults(makeResultsContextValue());
            captureException(new Error(res.message));
          } else {
            setResults(
              produce((ctx) => {
                ctx.cursor = cursor ?? null;

                for (const update of res.updates) {
                  const { blockId } = update;

                  if (!dequal(ctx.blockResults[blockId], update)) {
                    ctx.blockResults[blockId] = update;
                  }
                }
              })
            );
          }
        },
        error: captureException,
      });

    return () => {
      sub.unsubscribe();
    };
  }, [evaluationRequests, editor, padEditor, runtime]);

  const onChangeLanguage = useCallback(
    (value: SlateNode[]) => {
      if (editor == null || padEditor == null) {
        return;
      }

      const ops = editor.operations;
      if (!ops || ops.length === 0) {
        return;
      }

      editor.operations = [];
      padEditor.sendSlateOperations(ops);

      const codeBlocks = value.filter((node) => node.type === 'code_block');

      const program = codeBlocks.map((block) => ({
        id: block.id,
        source: getCodeFromBlock(block),
      }));

      evaluationRequests.next([
        {
          // Subscribe to results in all blocks
          subscriptions: codeBlocks.map((b) => b.id),
          program,
        },
        getCursorPos(editor),
      ]);

      setValue(value as Node[]);
    },
    [editor, padEditor, evaluationRequests, setValue]
  );

  return { onChangeLanguage, results };
};

function getCodeFromBlock(block: SlateNode): string {
  if (block.text) {
    return block.text;
  }

  return (block.children || []).map(getCodeFromBlock).join('\n');
}
