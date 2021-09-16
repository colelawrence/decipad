import { Element } from 'slate';
import { AST } from '@decipad/language';

export function getAssignmentBlock(
  id: string,
  name: string,
  value: AST.Expression
): AST.Block {
  return {
    type: 'block',
    id,
    args: [
      {
        type: 'assign',
        args: [
          {
            type: 'def',
            args: [name],
          },
          value,
        ],
      },
    ],
  };
}

export function getCodeFromBlock(block: SlateNode): string {
  if (block.text) {
    return block.text;
  }
  return (block.children || []).map(getCodeFromBlock).join('\n');
}

export interface SlateNode {
  type: string;
  children?: SlateNode[];
  text?: string;
  id: string;
}

export const isSlateNode = (thing?: unknown): thing is SlateNode => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return typeof (thing as any)?.type === 'string' && Element.isElement(thing);
};

export interface ImportDataNode extends SlateNode {
  'data-varname': string;
  'data-href': string;
  'data-contenttype': string;
}
