import {
  Editor,
  ELEMENT_CODE_LINE,
  ELEMENT_FETCH,
  interactiveElements,
} from '@decipad/editor-types';
import { ProgramBlocksContextValue } from '@decipad/ui';
import {
  getPlatePluginTypes,
  getRenderElement,
  PlatePlugin,
  TDescendant,
  TEditor,
} from '@udecode/plate';
import { useMemo } from 'react';
import { Editor as SlateEditor, Node, NodeEntry, Transforms } from 'slate';
import { RenderLeafProps } from 'slate-react';
import { useComputer } from '../../contexts/Computer';
import { CodeErrorHighlight } from '../../plate-components';
import { hasSyntaxError } from './common';
import { getCursorPos } from './getCursorPos';
import { getSyntaxErrorRanges } from './getSyntaxErrorRanges';
import { slateDocumentToComputeRequest } from './slateDocumentToComputeRequest';

interface IdentifiableBlock {
  type: string;
  id: string;
}

interface ParsedProgramBlock {
  id: string;
  index: number;
}

type ParsedProgramBlocks = ParsedProgramBlock[];

export const useLanguagePlugin = (): PlatePlugin => {
  const computer = useComputer();

  return useMemo(
    () => ({
      onChange: (editor: TEditor) => () => {
        computer.pushCompute(
          slateDocumentToComputeRequest((editor as unknown as Editor).children)
        );
        computer.setCursorBlockId(getCursorPos(editor));
      },
      decorate:
        (_editor: TEditor) =>
        ([node, path]: NodeEntry<TDescendant>) => {
          if (node.type !== ELEMENT_CODE_LINE) {
            return [];
          }

          const lineResult = computer.results.getValue().blockResults[node.id];

          return getSyntaxErrorRanges(path, lineResult);
        },
      renderLeaf: (_editor: SlateEditor) => (props: RenderLeafProps) => {
        return hasSyntaxError(props.leaf) ? (
          <CodeErrorHighlight {...props} variant={props.leaf.variant} />
        ) : (
          <>{props.children}</>
        );
      },
      renderElement: getRenderElement([...interactiveElements]),
      voidTypes: getPlatePluginTypes([...interactiveElements]),
    }),
    [computer]
  );
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
