import { Element } from 'slate';
import { AST } from '@decipad/language';

// Need this retval ambiguity for the typings to adapt to every kind of AST.Node
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const astNode = <T extends string, A extends unknown[]>(
  type: T,
  ...args: A
) => ({ type, args });

export function getAssignmentBlock(
  id: string,
  name: string,
  value: AST.Expression
): AST.Block {
  return {
    type: 'block',
    id,
    args: [astNode('assign', astNode('def', name), value)],
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
