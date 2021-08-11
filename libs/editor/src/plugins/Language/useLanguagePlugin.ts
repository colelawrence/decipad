import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { PlatePlugin } from '@udecode/plate';
import { useEffect, useMemo, useState } from 'react';
import { dequal } from 'dequal';
import { captureException } from '@sentry/react';
import { makeResultsContextValue, ResultsContextValue } from '@decipad/ui';
import { ComputeRequest, makeComputer } from '@decipad/language';
import { getCursorPos, CursorPos } from './getCursorPos';

interface SlateNode {
  type: string;
  children?: SlateNode[];
  text?: string;
  id: string;
}

interface UseLanguagePluginRet {
  languagePlugin: PlatePlugin;
  results: ResultsContextValue;
}

export const useLanguagePlugin = (): UseLanguagePluginRet => {
  const [results, setResults] = useState<ResultsContextValue>(
    makeResultsContextValue
  );

  const [evaluationRequests] = useState(
    () => new Subject<[ComputeRequest, CursorPos | null]>()
  );

  // Get some computation results based on evaluation requests
  useEffect(() => {
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
            setResults((ctx) => {
              const blockResultsKv = res.updates.map((newResult) => {
                const { blockId } = newResult;
                const previousResult = ctx.blockResults[blockId];

                // Stabilize newResult here -- it'll be equal but not ===
                // Don't trigger a re-render for results tables and whatnot
                const value = dequal(previousResult, newResult)
                  ? previousResult
                  : newResult;

                return [newResult.blockId, value];
              });

              return {
                cursor: cursor ?? null,
                blockResults: Object.fromEntries(blockResultsKv),
              };
            });
          }
        },
        error: captureException,
      });

    return () => {
      sub.unsubscribe();
    };
  }, [evaluationRequests]);

  return {
    languagePlugin: useMemo(
      () => ({
        onChange: (editor) => () => {
          const value = editor.children as SlateNode[];
          const codeBlocks = value.filter((node) => node.type === 'code_block');

          const program = codeBlocks.map((block) => ({
            id: block.id,
            source: getCodeFromBlock(block),
          }));

          evaluationRequests.next([{ program }, getCursorPos(editor)]);
        },
      }),
      [evaluationRequests]
    ),
    results,
  };
};

function getCodeFromBlock(block: SlateNode): string {
  if (block.text) {
    return block.text;
  } else {
    return (block.children || []).map(getCodeFromBlock).join('\n');
  }
}
