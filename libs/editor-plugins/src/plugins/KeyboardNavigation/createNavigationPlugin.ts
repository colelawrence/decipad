import {
  ELEMENT_CODE_LINE,
  ELEMENT_TABLE,
  ELEMENT_TABLE_VARIABLE_NAME,
  ELEMENT_TD,
  ELEMENT_TH,
  MyEditor,
  TableElement,
} from '@decipad/editor-types';
import {
  getParentNode,
  moveSelection,
  select,
  isElement,
} from '@udecode/plate';
import { getAboveNodeSafe, isElementOfType } from '@decipad/editor-utils';
import { Range } from 'slate';
import { createOnKeyDownPluginFactory } from '../../pluginFactories';

/**
 * This plugin handles navigation keys, such as
 * Tab and Enter. Different elements require different levels
 * of control, such as a table.
 */

export const createNavigationPlugin = createOnKeyDownPluginFactory({
  name: 'NAVIGATION_PLUGIN',
  plugin: (editor: MyEditor) => (event) => {
    const { selection } = editor;
    if (!selection) return;

    const cursor = Range.start(selection);
    const parentNode = getParentNode(editor, cursor);

    if (!parentNode) return;
    const [node] = parentNode;

    // Checks selection is collapsed
    if (selection.focus.offset !== selection.anchor.offset) return;

    if (isElementOfType(node, ELEMENT_CODE_LINE) && event.key === 'Tab') {
      event.preventDefault();
      // add 2 spaces instead of tab, tabs are just too big by default.
      editor.insertText('  ');
    } else if (
      isElementOfType(node, ELEMENT_TD) ||
      isElementOfType(node, ELEMENT_TH) ||
      isElementOfType(node, ELEMENT_TABLE_VARIABLE_NAME)
    ) {
      // get the table element
      const table = getAboveNodeSafe<TableElement>(editor, {
        at: cursor,
        match: (n) => isElement(n) && n.type === ELEMENT_TABLE,
      });

      if (!table) return;

      if (event.key === 'Tab') {
        event.preventDefault();
        event.stopPropagation();
        // Move to the next cell (to the right).
        // or to the element below if at the end of the table (bottom right corner).
        // if shift is also pressed, move backwards.
        try {
          moveSelection(editor, {
            distance: 1,
            unit: 'line',
            reverse: event.shiftKey,
          });
        } catch (e) {
          // Catch when there is no next node.
        }
      } else if (event.key === 'Enter') {
        // Move to the next row (below the current cell).
        event.preventDefault();
        event.stopPropagation();
        const direction = 1;
        const path = [...cursor.path];

        try {
          // if user is at the last usable row of table
          if (table[0].children.length > path[1] + 1 && direction === 1) {
            path[1] += direction;
            select(editor, path);
          } else if (
            table[0].children[1].children.length - 1 > path[2] &&
            direction === 1
          ) {
            // if the user is not on the bottom right cell
            path[1] = 2;
            path[2] += direction;
            select(editor, path);
          }
        } catch (e) {
          // just in case type casting goes wrong.
        }
      }
    }
  },
});
