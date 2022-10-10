import { ClientEventContextType } from '@decipad/client-events';
import { createOverrideApplyPluginFactory } from '@decipad/editor-plugins';
import { BaseElement, ElementKind } from '@decipad/editor-types';
import { getParentNode } from '@udecode/plate';

export const createUserEventPlugin = (events: ClientEventContextType) => {
  return createOverrideApplyPluginFactory({
    name: 'CREATE_USER_EVENTS_PLUGIN',
    plugin: (editor, apply) => {
      return (op) => {
        apply(op);
        if (op.type !== 'set_selection') {
          if (op.type === 'insert_text') {
            try {
              const parentNode = getParentNode(editor, op.path);
              if (!parentNode) return;

              const editorParent = editor.children[parentNode[1][0]];

              const node = parentNode[0] as unknown as BaseElement;

              events({
                type: 'action',
                action: 'element interaction',
                props: {
                  element: node.type,
                  parent: editorParent.type,
                  variant:
                    'variant' in editorParent
                      ? (editorParent.variant as string)
                      : undefined,
                  text: node.children[0].text as string,
                },
              });
            } catch (e) {
              console.warn(e);
            }
          } else if (op.type === 'insert_node') {
            if ('id' in op.node) {
              events({
                type: 'action',
                action: 'element creation',
                props: {
                  element: op.node.type as ElementKind,
                },
              });
            }
          }
        }
      };
    },
  })();
};
