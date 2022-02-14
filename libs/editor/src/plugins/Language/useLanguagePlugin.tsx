import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { PlatePlugin, TDescendant } from '@udecode/plate';
import { ContextType, useEffect, useMemo, useState } from 'react';
import { dequal } from 'dequal';
import { captureException } from '@sentry/react';
import { Editor, Node, NodeEntry, Transforms } from 'slate';

import { ProgramBlocksContextValue } from '@decipad/ui';
import { ResultsContext, useResults } from '@decipad/react-contexts';
import { ComputeRequest } from '@decipad/language';
import { slateDocumentToComputeRequest } from './slateDocumentToComputeRequest';
import { hasSyntaxError } from './common';
import { ELEMENT_CODE_LINE, ELEMENT_FETCH } from '../../elements';
import { useComputer } from '../../contexts/Computer';
import { CodeErrorHighlight } from '../../components';
import { getSyntaxErrorRanges } from './getSyntaxErrorRanges';

interface UseLanguagePluginRet {
  languagePlugin: PlatePlugin;
  results: ContextType<typeof ResultsContext>;
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
  const computer = useComputer();
  const defaultResults = useResults();
  const [results, setResults] = useState(defaultResults);

  const [computeRequests] = useState(() => new Subject<ComputeRequest>());

  // Get some computation results based on evaluation requests
  useEffect(() => {
    const sub = computeRequests
      .pipe(
        // Debounce to give React an easier time
        debounceTime(100),
        // Make sure the new request is actually different
        distinctUntilChanged(dequal),
        // Compute me some computes!
        switchMap((req) => computer.compute(req))
      )
      // Catch all errors here
      .subscribe({
        next: (res) => {
          if (res.type === 'compute-panic') {
            setResults(defaultResults);
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
  }, [computeRequests, computer, defaultResults]);

  return {
    languagePlugin: useMemo(
      () => ({
        onChange: (editor) => () => {
          const computeRequest = slateDocumentToComputeRequest(editor.children);

          computeRequests.next(computeRequest);
        },
        decorate:
          (_editor) =>
          ([node, path]: NodeEntry<TDescendant>) => {
            if (node.type !== ELEMENT_CODE_LINE) {
              return [];
            }

            const lineResult = results.blockResults[node.id];

            return getSyntaxErrorRanges(path, lineResult);
          },
        renderLeaf: (_editor) => (props) => {
          return hasSyntaxError(props.leaf) ? (
            <CodeErrorHighlight {...props} variant={props.leaf.variant} />
          ) : (
            <>{props.children}</>
          );
        },
      }),
      [computeRequests, results]
    ),
    results,
  };
};

export function editorProgramBlocks(editor: Editor): ProgramBlocksContextValue {
  const editorBlocks: Node[] = editor.children;
  const parsedProgramBlocks = editorBlocks
    .map((block, index) => {
      if ((block as unknown as IdentifiableBlock).type === ELEMENT_FETCH) {
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
