import { Descendant, Editor, Node, Text, Transforms, Path } from 'slate';
import { ELEMENT_CODE_LINE } from '@udecode/plate';

function reconcileByMergingWithNext(editor: Editor, path: Path): void {
  const last = path[path.length - 1];
  const nextPath = [...path.slice(0, path.length - 2), last + 1];
  if (Node.has(editor, nextPath)) {
    // merge the 2 code_line nodes
    Transforms.mergeNodes(editor, { at: nextPath });

    const parentCodeLineLocation = [...path.slice(0, path.length - 1)];
    const textChildren = Array.from(
      Editor.nodes(editor, { at: parentCodeLineLocation, mode: 'lowest' })
    );
    const textNodeCount = textChildren.length;
    const softBreakPath = [...parentCodeLineLocation, textNodeCount - 1];
    Transforms.insertNodes(
      editor,
      {
        text: '\n',
      } as Descendant,
      { at: softBreakPath }
    );
  }
}

function reconcileBySplitting(
  editor: Editor,
  expectedStatement: string,
  childText: string,
  path: Path
): void {
  const newNode = {
    type: ELEMENT_CODE_LINE,
    children: [
      {
        text: expectedStatement,
      },
    ],
  };
  Transforms.insertNodes(editor, newNode, {
    at: path.slice(0, path.length - 1),
  });
  const newTextPath = [
    ...path.slice(0, path.length - 2),
    path[path.length - 2] + 1,
    path[path.length - 1],
  ];
  let remainingText = childText.slice(expectedStatement.length);
  if (remainingText.startsWith('\n')) {
    remainingText = remainingText.slice(1);
  }
  Transforms.insertText(editor, remainingText, {
    at: newTextPath,
  });
}

function reconcileStatement(
  editor: Editor,
  expectedStatement: string,
  childText: string,
  path: Path
): void {
  if (expectedStatement.length < childText.length) {
    reconcileBySplitting(editor, expectedStatement, childText, path);
  } else if (expectedStatement.length > childText.length) {
    reconcileByMergingWithNext(editor, path);
  }
}

function reconcileChild(
  editor: Editor,
  child: Descendant,
  expectedStatement: string,
  path: Path
): boolean {
  if (Text.isText(child)) {
    const childText = child.text;
    if (childText.length && childText.trim() !== expectedStatement.trim()) {
      reconcileStatement(editor, expectedStatement, childText, path);
      return true;
    }
  } else if (Node.isNode(child)) {
    let index = -1;
    for (const grandChild of child.children) {
      index += 1;
      if (
        reconcileChild(editor, grandChild, expectedStatement, [...path, index])
      ) {
        return true;
      }
    }
  }
  return false;
}

export function reconcileStatements(
  editor: Editor,
  statements: string[],
  children: Descendant[],
  path: Path
): boolean {
  let index = -1;
  for (const child of children) {
    index += 1;
    const expectedText = statements[index] ?? '';
    if (
      reconcileChild(editor, child as unknown as Descendant, expectedText, [
        ...path,
        index,
      ])
    ) {
      return true;
    }
  }
  return false;
}
