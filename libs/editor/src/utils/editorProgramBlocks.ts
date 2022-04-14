import { ELEMENT_FETCH } from '@decipad/editor-types';
import { ProgramBlocksContextValue } from '@decipad/ui';
import { TEditor } from '@udecode/plate';
import { Editor as SlateEditor, Node, Transforms } from 'slate';

interface IdentifiableBlock {
  type: string;
  id: string;
}

interface ParsedProgramBlock {
  id: string;
  index: number;
}

type ParsedProgramBlocks = ParsedProgramBlock[];

export function editorProgramBlocks(
  editor: TEditor
): ProgramBlocksContextValue {
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
