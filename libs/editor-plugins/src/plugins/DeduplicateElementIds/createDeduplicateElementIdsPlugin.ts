import { AnyElement, createTPluginFactory } from '@decipad/editor-types';
import { pluginStore } from '@decipad/editor-utils';
import { Element } from 'slate';
import { findNode, isElement, nanoid, setNodes } from '@udecode/plate';
import { getDefined } from '@decipad/utils';

const key = 'DEDUPLICATE_ELEMENT_IDS_PLUGIN';

interface DeduplicateElementIdsPluginStore {
  seenIds: Set<string>;
  needsDeduping: Map<string, Element[]>;
}

const createStore = (): DeduplicateElementIdsPluginStore => ({
  needsDeduping: new Map(),
  seenIds: new Set(),
});

export const createDeduplicateElementIdsPlugin = createTPluginFactory({
  key,
  withOverrides: (editor) => {
    const { seenIds, needsDeduping } = pluginStore(editor, key, createStore);
    const { apply, normalizeNode } = editor;

    const insertNeedsDeduping = (id: string, element: Element) => {
      console.info('needs deduping', id);
      if (needsDeduping.has(id)) {
        getDefined(needsDeduping.get(id)).push(element);
      } else {
        needsDeduping.set(id, [element]);
      }
    };

    const removeNeedsDeduping = (id: string, element: Element) => {
      const elements = getDefined(needsDeduping.get(id));
      const elementPos = elements.indexOf(element);
      elements.splice(elementPos, 1);
      if (elements.length === 0) {
        needsDeduping.delete(id);
      }
    };

    // eslint-disable-next-line no-param-reassign
    editor.apply = (op) => {
      apply(op);
      if (op.type === 'insert_node' && isElement(op.node)) {
        const el = op.node as AnyElement;
        if (el.id && seenIds.has(el.id)) {
          insertNeedsDeduping(el.id, op.node);
        }
        seenIds.add(el.id);
      } else if (
        op.type === 'set_node' &&
        'id' in op.newProperties &&
        op.newProperties.id
      ) {
        seenIds.delete(op.newProperties.id as string);
      } else if (op.type === 'remove_node' && 'id' in op.node && op.node.id) {
        seenIds.delete(op.node.id as string);
      } else if (
        op.type === 'split_node' &&
        'id' in op.properties &&
        op.properties.id
      ) {
        const lookForId = op.properties.id;
        const entry = findNode(editor, {
          match: (n) => isElement(n) && n.id === lookForId,
        });
        if (entry && isElement(entry[0])) {
          insertNeedsDeduping(op.properties.id as string, entry[0]);
        }
      }
    };

    // eslint-disable-next-line no-param-reassign
    editor.normalizeNode = (entry) => {
      const [n, path] = entry;
      if (!isElement(n)) {
        // early break
        return normalizeNode(entry);
      }
      const elementsNeedingDedup = needsDeduping.get((n as AnyElement).id);
      if (elementsNeedingDedup) {
        if (elementsNeedingDedup.includes(n)) {
          console.info('fixing deduping', n.id);
          setNodes(editor, { id: nanoid() }, { at: path });
          removeNeedsDeduping((n as AnyElement).id, n);
        }
        return;
      }
      return normalizeNode(entry);
    };

    return editor;
  },
});
