import { isText, Node } from '@decipad/editor-types';
import { AST } from '@decipad/language';
import { TText } from '@udecode/plate';
import { ComponentProps } from 'react';
import { CodeErrorHighlight } from '../../components';
import { astNode } from '../../utils/astNode';

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

export function getRefBlock(id: string, name: string): AST.Block {
  return {
    type: 'block',
    id,
    args: [astNode('ref', name)],
  };
}

export function getCodeFromBlock(block: Node): string {
  if (isText(block)) {
    return block.text;
  }
  return (block.children || []).map(getCodeFromBlock).join('\n');
}
