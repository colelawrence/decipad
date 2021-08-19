import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { PlatePlugin, ELEMENT_CODE_BLOCK } from '@udecode/plate';
import { useEffect, useMemo, useState } from 'react';
import { dequal } from 'dequal';
import { captureException } from '@sentry/react';
import { Editor, Node, Transforms } from 'slate';
import {
  makeResultsContextValue,
  ResultsContextValue,
  ELEMENT_IMPORT_DATA,
  ProgramBlocksContextValue,
} from '@decipad/ui';
import { ComputeRequest, makeComputer, Program, AST } from '@decipad/language';
import { getCursorPos, CursorPos } from './getCursorPos';

interface SlateNode {
  type: string;
  children?: SlateNode[];
  text?: string;
  id: string;
}

interface ImportDataNode extends SlateNode {
  'data-varname': string;
  'data-href': string;
  'data-contenttype': string;
}

interface UseLanguagePluginRet {
  languagePlugin: PlatePlugin;
  results: ResultsContextValue;
}

interface IdentifiableBlock {
  type: string;
  id: string;
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
          const program = getBlocks(value);

          evaluationRequests.next([{ program }, getCursorPos(editor)]);
        },
      }),
      [evaluationRequests]
    ),
    results,
  };
};

export function editorProgramBlocks(editor: Editor): ProgramBlocksContextValue {
  const editorBlocks: Node[] = editor.children;
  const parsedProgramBlocks = editorBlocks
    .map((block, index) => {
      if (
        (block as unknown as IdentifiableBlock).type === ELEMENT_IMPORT_DATA
      ) {
        return {
          id: (block as unknown as IdentifiableBlock).id,
          index,
          varNameListeners: [],
        };
      }
      return undefined;
    })
    .filter(Boolean);

  return {
    setBlockVarName(blockId: string, varName: string): void {
      const idx = parsedProgramBlocks.findIndex((b) => b && b.id === blockId);
      if (editor && idx >= 0) {
        const block = parsedProgramBlocks[idx];
        if (block) {
          const location = [block.index];
          Transforms.setNodes(
            editor,
            { 'data-varname': varName } as Partial<Node>,
            { at: location }
          );
        }
      }
    },
  };
}

function getBlocks(value: SlateNode[]): Program {
  return value
    .filter(
      (block) =>
        block.type === ELEMENT_CODE_BLOCK || block.type === ELEMENT_IMPORT_DATA
    )
    .map((block) => {
      if (block.type === ELEMENT_CODE_BLOCK) {
        return {
          id: block.id,
          type: 'unparsed-block',
          source: getCodeFromBlock(block),
        };
      }
      // block.type === ELEMENT_IMPORT_DATA) {
      return {
        id: block.id,
        type: 'parsed-block',
        value: getAstFromImportData(block as ImportDataNode),
      };
    });
}

function getCodeFromBlock(block: SlateNode): string {
  if (block.text) {
    return block.text;
  }
  return (block.children || []).map(getCodeFromBlock).join('\n');
}

function getAstFromImportData(importData: ImportDataNode): AST.Block {
  return {
    type: 'block',
    id: importData.id,
    args: [
      {
        type: 'assign',
        args: [
          {
            type: 'def',
            args: [importData['data-varname']],
          },
          {
            type: 'imported-data',
            args: [importData['data-href'], importData['data-contenttype']],
          },
        ],
      },
    ],
  };
}
