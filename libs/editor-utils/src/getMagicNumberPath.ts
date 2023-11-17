import { MARK_MAGICNUMBER, MyEditor } from '@decipad/editor-types';
import { TNode, getNodeTexts } from '@udecode/plate';
import { Path } from 'slate';

/**
 * Get magic number path from what node looks like.
 * We use this instead of `findNodePath` because `findNodePath` requires
 * the magic number to be rendered (It uses ReactEditor), so we can't rely on this
 * being true (because of tabs).
 *
 * @example
 * ```js
 * const magicNumberPath = getMagicNumberPath(editor, { [MARK_MAGICNUMBER]: true, text: getExprRef("id")})
 * ```
 */
export function getMagicNumberPath(
  editor: MyEditor,
  node: TNode
): Path | undefined {
  const allTexts = Array.from(getNodeTexts(editor));
  let nodePath: Path | undefined;

  for (const [textNode, path] of allTexts) {
    if (!(MARK_MAGICNUMBER in textNode && 'text' in textNode)) continue;
    if (textNode.text !== node?.text) continue;

    nodePath = path;
    break;
  }

  return nodePath;
}
