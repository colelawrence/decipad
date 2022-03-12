import { captureException } from '@sentry/react';
import {
  getPlatePluginTypes,
  getRenderElement,
  PlatePlugin,
  TDescendant,
} from '@udecode/plate';
import { dequal } from 'dequal';
import { ContextType, useEffect, useMemo, useState } from 'react';
import { BehaviorSubject, Subject } from 'rxjs';
import { concatMap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Editor, Node, NodeEntry, Transforms } from 'slate';

import { ComputeRequest } from '@decipad/language';
import { ResultsContext, useResults } from '@decipad/react-contexts';
import { ProgramBlocksContextValue } from '@decipad/ui';

import { CodeErrorHighlight } from '../../components';
import { useComputer } from '../../contexts/Computer';
import { ELEMENT_CODE_LINE, ELEMENT_FETCH } from '../../elements';

import { hasSyntaxError } from './common';
import { delayErrors } from './delayErrors';
import { getCursorPos } from './getCursorPos';
import { getSyntaxErrorRanges } from './getSyntaxErrorRanges';
import { languageElements } from './languageElements';
import { slateDocumentToComputeRequest } from './slateDocumentToComputeRequest';

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
  const [cursors] = useState(() => new BehaviorSubject<string | null>(null));

  // Get some computation results based on evaluation requests
  useEffect(() => {
    const sub = computeRequests
      .pipe(
        // Debounce to give React an easier time
        debounceTime(100),
        // Make sure the new request is actually different
        distinctUntilChanged((prevReq, req) => dequal(prevReq, req)),
        // Compute me some computes!
        concatMap((req) => computer.compute(req)),
        delayErrors({
          distinctCursor$: cursors.pipe(distinctUntilChanged()),
          getCursor: () => cursors.getValue(),
        })
      )
      // Catch all errors here
      .subscribe({
        next: (res) => {
          if (res.type === 'compute-panic') {
            setResults(defaultResults);
            captureException(new Error(res.message));
          } else {
            setResults((previous) => {
              const blockResultsKv = res.updates.map((newResult) => {
                const previousResult = previous.blockResults[newResult.blockId];

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
  }, [computeRequests, cursors, computer, defaultResults]);

  return {
    languagePlugin: useMemo(
      () => ({
        onChange: (editor) => () => {
          computeRequests.next(slateDocumentToComputeRequest(editor.children));
          cursors.next(getCursorPos(editor));
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
        renderElement: getRenderElement(languageElements),
        voidTypes: getPlatePluginTypes(languageElements),
      }),
      [computeRequests, cursors, results]
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
