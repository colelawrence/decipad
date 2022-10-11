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
        // Try catch because we are doing some castings, and all of them are ok,
        // But just in case.
        try {
          if (op.type !== 'set_selection') {
            if (op.type === 'insert_text') {
              const parentNode = getParentNode(editor, op.path);
              if (!parentNode) return;

              const editorParent = editor.children[parentNode[1][0]];

              const node = parentNode[0] as unknown as BaseElement;

              events({
                type: 'checklist',
                props: {
                  interaction: 'interaction',
                  element: node.type,
                  parent: editorParent.type,
                  variant:
                    'variant' in editorParent
                      ? (editorParent.variant as string)
                      : undefined,
                  text: node.children[0].text as string,
                },
              });
            } else if (op.type === 'insert_node') {
              if ('id' in op.node) {
                events({
                  type: 'checklist',
                  props: {
                    interaction: 'creation',
                    element: op.node.type as ElementKind,
                  },
                });
              }
            } else if (op.type === 'set_node') {
              if ('type' in op.newProperties) {
                // Plate sets newProperties as an object, so we must do some
                // Interesting castings
                const newNode = (op.newProperties as any).type as ElementKind;
                events({
                  type: 'checklist',
                  props: {
                    interaction: 'creation',
                    element: newNode,
                  },
                });
              }
            }
          }
        } catch (e) {
          console.warn(e);
        }
      };
    },
  })();
};
