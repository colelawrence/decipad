import {
  ELEMENT_PARAGRAPH,
  ParagraphElement,
  MyEditor,
  MyNodeEntry,
} from '@decipad/editor-types';
import { insertNodes, isEditor } from '@udecode/plate';
import { createNormalizerPluginFactory } from '../../pluginFactories';

/**
 * Plate adds a new paragraph element underneath non paragraph elements,
 * however it does not do this to p elements themselves,
 * this plugin checks the last element is a paragraph and not empty,
 * and adds a new paragraph at the end of the editor.
 */
export const createNormalizeNewParagraphPlugin = createNormalizerPluginFactory({
  name: 'NORMALIZE_NEW_PARAGRAPH_PLUGIN',
  plugin: (editor: MyEditor) => (entry: MyNodeEntry) => {
    const [node] = entry;

    if (isEditor(node)) {
      const lastElement = node.children[node.children.length - 1];
      if (
        lastElement.type === ELEMENT_PARAGRAPH &&
        lastElement.children[0].text !== ''
      ) {
        insertNodes(
          editor,
          {
            type: ELEMENT_PARAGRAPH,
            children: [
              {
                text: '',
              },
            ],
          } as unknown as ParagraphElement,
          {
            at: [node.children.length],
          }
        );
        return true;
      }
    }
    return false;
  },
});
