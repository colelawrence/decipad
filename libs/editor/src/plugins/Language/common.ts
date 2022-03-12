import { Element } from 'slate';
import { TText } from '@udecode/plate';
import { AST } from '@decipad/language';
import { ComponentProps } from 'react';
import { Node, PlainText } from '../../elements/types';
import { astNode } from '../../utils/astNode';
import { CodeErrorHighlight } from '../../components';

export interface SyntaxErrorAnnotation {
  isSyntaxError: true;
  variant: ComponentProps<typeof CodeErrorHighlight>['variant'];
}
export const hasSyntaxError = (
  leaf: TText
): leaf is TText & SyntaxErrorAnnotation => leaf.isSyntaxError === true;

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

export function getCodeFromBlock(block: Node | PlainText): string {
  if ('text' in block) {
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
