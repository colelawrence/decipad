import {
  Editor,
  ELEMENT_CODE_LINE,
  ELEMENT_FETCH,
  interactiveElements,
} from '@decipad/editor-types';
import { ComputeRequest, getDelayedBlockId } from '@decipad/language';
import {
  defaultResults,
  ResultsContext,
  ResultsContextItem,
} from '@decipad/react-contexts';
import { ProgramBlocksContextValue } from '@decipad/ui';
import { captureException } from '@sentry/react';
import {
  getPlatePluginTypes,
  getRenderElement,
  PlatePlugin,
  TDescendant,
} from '@udecode/plate';
import { dequal } from 'dequal';
import { ContextType, useEffect, useMemo, useRef, useState } from 'react';
import { EMPTY, Subject } from 'rxjs';
import {
  concatMap,
  debounceTime,
  distinctUntilChanged,
  map,
  shareReplay,
} from 'rxjs/operators';
import { Editor as SlateEditor, Node, NodeEntry, Transforms } from 'slate';
import { useComputer } from '../../contexts/Computer';
import { CodeErrorHighlight } from '../../plate-components';
import { hasSyntaxError } from './common';
import { getCursorPos } from './getCursorPos';
import { getSyntaxErrorRanges } from './getSyntaxErrorRanges';
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
  const [results, setResults] =
    useState<ContextType<typeof ResultsContext>>(EMPTY);

  const [computeRequests] = useState(() => new Subject<ComputeRequest>());
  const cursorBlockIdRef = useRef<string | null>(null);
  const previousResultRef = useRef<ResultsContextItem>(defaultResults);

  // Get some computation results based on evaluation requests
  useEffect(() => {
    const results$ = computeRequests.pipe(
      // Debounce to give React an easier time
      debounceTime(100),
      // Make sure the new request is actually different
      distinctUntilChanged((prevReq, req) => dequal(prevReq, req)),
      // Compute me some computes!
      concatMap((req) => computer.compute(req)),
      map((res): ResultsContextItem => {
        if (res.type === 'compute-panic') {
          captureException(new Error(res.message));
          return defaultResults;
        }
        const blockResults = Object.fromEntries(
          res.updates.map((result) => [result.blockId, result])
        );

        return {
          blockResults,
          indexLabels: res.indexLabels,
          delayedResultBlockId: getDelayedBlockId(
            res,
            cursorBlockIdRef.current
          ),
        };
      }),
      shareReplay(1)
    );

    setResults(results$);

    const previousResultSub = results$.subscribe((result) => {
      previousResultRef.current = result;
    });
    return () => previousResultSub.unsubscribe();
  }, [computeRequests, computer]);

  return {
    languagePlugin: useMemo(
      () => ({
        onChange: (editor) => () => {
          computeRequests.next(
            slateDocumentToComputeRequest(
              (editor as unknown as Editor).children
            )
          );
          cursorBlockIdRef.current = getCursorPos(editor);
        },
        decorate:
          (_editor) =>
          ([node, path]: NodeEntry<TDescendant>) => {
            if (node.type !== ELEMENT_CODE_LINE) {
              return [];
            }

            const lineResult = previousResultRef.current.blockResults[node.id];

            return getSyntaxErrorRanges(path, lineResult);
          },
        renderLeaf: (_editor) => (props) => {
          return hasSyntaxError(props.leaf) ? (
            <CodeErrorHighlight {...props} variant={props.leaf.variant} />
          ) : (
            <>{props.children}</>
          );
        },
        renderElement: getRenderElement([...interactiveElements]),
        voidTypes: getPlatePluginTypes([...interactiveElements]),
      }),
      [computeRequests]
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
          editor as unknown as SlateEditor,
          { 'data-varname': varName } as Partial<Node>,
          { at: [block.index] }
        );
      });
    },
    setBlockProvider(blockId: string, provider: string): void {
      withBlock(blockId, parsedProgramBlocks, (block) => {
        Transforms.setNodes(
          editor as unknown as SlateEditor,
          { 'data-provider': provider } as Partial<Node>,
          { at: [block.index] }
        );
      });
    },
    setBlockExternalId(blockId: string, externalId: string): void {
      withBlock(blockId, parsedProgramBlocks, (block) => {
        Transforms.setNodes(
          editor as unknown as SlateEditor,
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
