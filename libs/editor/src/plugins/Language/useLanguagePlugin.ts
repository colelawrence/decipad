import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { PlatePlugin } from '@udecode/plate';
import { useEffect, useMemo, useState } from 'react';
import { dequal } from 'dequal';
import { captureException } from '@sentry/react';
import { Editor, Node, Transforms } from 'slate';
import {
  makeResultsContextValue,
  ResultsContextValue,
  ProgramBlocksContextValue,
} from '@decipad/ui';
import { Computer, ComputeRequest, makeComputeStream } from '@decipad/language';
import { getCursorPos, CursorPos } from './getCursorPos';
import { slateDocumentToComputeRequest } from './slateDocumentToComputeRequest';
import { SlateNode } from './common';
import { ELEMENT_IMPORT_DATA } from '../../utils/elementTypes';

interface UseLanguagePluginRet {
  languagePlugin: PlatePlugin;
  results: ResultsContextValue;
}

interface IdentifiableBlock {
  type: string;
  id: string;
}

interface ParsedProgramBlock {
  id: string;
  index: number;
}

type ParsedProgramBlocks = ParsedProgramBlock[];

export const useLanguagePlugin = (): UseLanguagePluginRet => {
  const [computer] = useState(() => new Computer());
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
        makeComputeStream({ computer })
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
                const previousResult = ctx.blockResults[newResult.blockId];

                // Stabilize newResult here -- it'll be equal but not ===
                // Don't trigger a re-render for results tables and whatnot
                const value = dequal(previousResult, newResult)
                  ? previousResult
                  : newResult;

                return [newResult.blockId, value];
              });

              return {
                cursor,
                blockResults: Object.fromEntries(blockResultsKv),
                indexLabels: res.indexLabels,
              };
            });
          }
        },
        error: captureException,
      });

    return () => {
      sub.unsubscribe();
    };
  }, [evaluationRequests, computer]);

  return {
    languagePlugin: useMemo(
      () => ({
        onChange: (editor) => () => {
          const value = editor.children as SlateNode[];
          const computeRequest = slateDocumentToComputeRequest(value);

          evaluationRequests.next([computeRequest, getCursorPos(editor)]);
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
        };
      }
      return undefined;
    })
    .filter(Boolean) as ParsedProgramBlocks;

  return {
    setBlockVarName(blockId: string, varName: string): void {
      withBlock(blockId, parsedProgramBlocks, (block) => {
        Transforms.setNodes(
          editor,
          { 'data-varname': varName } as Partial<Node>,
          { at: [block.index] }
        );
      });
    },
    setBlockProvider(blockId: string, provider: string): void {
      withBlock(blockId, parsedProgramBlocks, (block) => {
        Transforms.setNodes(
          editor,
          { 'data-provider': provider } as Partial<Node>,
          { at: [block.index] }
        );
      });
    },
    setBlockExternalId(blockId: string, externalId: string): void {
      withBlock(blockId, parsedProgramBlocks, (block) => {
        Transforms.setNodes(
          editor,
          { 'data-external-id': externalId } as Partial<Node>,
          {
            at: [block.index],
          }
        );
      });
    },
  };
}

function withBlock(
  id: string,
  blocks: ParsedProgramBlocks,
  fn: (block: ParsedProgramBlock) => void
) {
  const block = blocks.find((b) => b?.id === id);
  if (block != null) {
    fn(block);
  }
}
