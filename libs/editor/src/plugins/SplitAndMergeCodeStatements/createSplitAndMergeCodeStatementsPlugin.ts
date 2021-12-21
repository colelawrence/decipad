/* eslint-disable no-param-reassign */
// TODO fix node types
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ELEMENT_CODE_BLOCK,
  getPlatePluginWithOverrides,
  WithOverride,
} from '@udecode/plate';
import { Descendant, Element, Node, Text } from 'slate';
import { splitCodeIntoStatements } from './splitCodeIntoStatements';
import { reconcileStatements } from './reconcileStatements';

type TypedNode = Node & {
  type: string;
};

function codeFromCodeBlockChild(child: Descendant): string {
  if (Text.isText(child)) {
    return child.text;
  }
  if (Element.isElement(child)) {
    return child.children.map(codeFromCodeBlockChild).join('\n');
  }
  throw new Error(`not sure what to do with node${child}`);
}

function codeFromCodeBlockChildren(children: Descendant[]): string {
  return children.map(codeFromCodeBlockChild).join('\n');
}

export const WithSplitAndMergeCodeStatements = (): WithOverride => (editor) => {
  const { normalizeNode } = editor;

  editor.normalizeNode = (entry) => {
    const [node, path] = entry;

    // If the element is a code block, ensure its children are valid.
    if (
      Element.isElement(node) &&
      (node as TypedNode).type === ELEMENT_CODE_BLOCK
    ) {
      const children = Array.from(Node.children(editor, path)).map(
        ([child]) => child
      );
      const blockCode = codeFromCodeBlockChildren(children);
      const statements = splitCodeIntoStatements(blockCode);
      if (
        statements.length &&
        reconcileStatements(editor, statements, children, path)
      ) {
        return;
      }
    }

    // Fall back to the original `normalizeNode` to enforce other constraints.
    normalizeNode(entry);
  };

  return editor;
};

export const createSplitAndMergeCodeStatementsPlugin =
  getPlatePluginWithOverrides(WithSplitAndMergeCodeStatements);
