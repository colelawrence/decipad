import {
  DataViewElement,
  ELEMENT_DATA_VIEW,
  MyEditor,
  MyNodeEntry,
  OldDataViewElement,
} from '@decipad/editor-types';
import { assertElementType } from '@decipad/editor-utils';
import { dequal } from '@decipad/utils';
import { insertNodes, removeNodes, setNodes } from '@udecode/plate-common';
import { cloneDeep, merge, omit } from 'lodash';
import {
  NormalizerReturnValue,
  createNormalizerPlugin,
} from '@decipad/editor-plugin-factories';

function migrateDataviewSpecToJun24(
  old: Partial<OldDataViewElement>
): DataViewElement {
  const newSpec: DataViewElement = {
    ...old,
    schema: 'jun-2024',
    type: old.type || ELEMENT_DATA_VIEW,
    id: old.id!, // break if migration doesnt have block id
    children: (old.children?.map((child) => {
      if (child.type === 'table-caption') {
        return {
          ...child,
          type: 'data-view-caption',
          children:
            child.children?.map((subChild) => {
              if (subChild.type === 'table-var-name') {
                return { ...subChild, type: 'data-view-name' };
              }
              return subChild;
            }) || [],
        };
      }
      if (child.type === 'data-view-tr') {
        return {
          ...child,
          children: child.children || [],
        };
      }
      return child;
    }) || []) as any,
    expandedGroups: [],
  };

  return newSpec;
}

export const createMigrateDataviewPlugin = () =>
  createNormalizerPlugin({
    name: 'CREATE_MIGRATE_DATAVIEW_PLUGIN',
    elementType: ELEMENT_DATA_VIEW,
    plugin:
      (editor: MyEditor) =>
      ([node, path]: MyNodeEntry): NormalizerReturnValue => {
        // function to migrate from original dataview to `jun-2024` version
        assertElementType(node, ELEMENT_DATA_VIEW);

        if (node.schema === 'jun-2024') return false;

        const newDVNode = migrateDataviewSpecToJun24(node as any);

        if (node.children[0].type !== 'data-view-caption') {
          return () => {
            removeNodes(editor, { at: [...path, 0] });
            insertNodes(editor, newDVNode.children[0], { at: [...path, 0] });
          };
        }

        if (node.children[1].type !== 'data-view-tr') {
          return () => {
            removeNodes(editor, { at: [...path, 1] });
            insertNodes(editor, newDVNode.children[1], { at: [...path, 1] });
          };
        }

        const clonedNode = cloneDeep(omit(node, 'children'));
        const clonedNewDVNode = cloneDeep(omit(newDVNode, 'children'));

        const migratedNode = merge(clonedNode, clonedNewDVNode) as any;

        if (dequal(migratedNode, node)) {
          return false;
        }

        return () => {
          setNodes(editor, omit(migratedNode, 'children'), { at: path });
        };
      },
  });
