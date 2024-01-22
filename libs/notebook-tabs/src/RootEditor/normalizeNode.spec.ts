import {
  Editor,
  Element,
  NodeEntry,
  createEditor as createEditorSlate,
} from 'slate';
import { normalizeCurried } from './normalizeNode';
import { TEditor } from '@udecode/plate-common';

function createEditor() {
  return createEditorSlate() as TEditor;
}

describe('Normalize node', () => {
  const editor = createEditor();
  editor.normalize = normalizeCurried(editor, []);

  it('removes invalid node', () => {
    editor.children = [{}] as any;
    editor.normalize();

    expect(editor.children).toHaveLength(0);
  });

  it('leaves valid node', () => {
    editor.children = [
      {
        children: [],
      },
    ] as any;
    editor.normalize();

    expect(editor.children).toHaveLength(1);
    expect(editor.children).toMatchObject([
      {
        children: [],
      },
    ]);
  });
});

describe('Normalizes with plugins', () => {
  const editor = createEditor();

  it('Simple plugin to maintain structure - Keep at least one node', () => {
    const oneChildPlugin = (entry: NodeEntry): boolean => {
      const [, path] = entry;

      if (path.length === 0 && editor.children.length === 0) {
        editor.apply({
          type: 'insert_node',
          path: [0],
          node: {
            hello: 'empty-node',
            children: [],
          },
        } as any);
        return true;
      }

      return false;
    };

    editor.normalize = normalizeCurried(editor, [oneChildPlugin]);
    editor.normalize();

    expect(editor.children).toHaveLength(1);
    expect(editor.children).toMatchObject([
      {
        hello: 'empty-node',
        children: [],
      },
    ]);
  });

  it('Runs plugin to add text node to elements with empty children arrays', () => {
    const oneTextNode = (entry: NodeEntry): boolean => {
      const [node, path] = entry;

      if (path.length === 0) return false;
      if (!Element.isElement(node)) return false;

      if (node.children.length === 0) {
        editor.apply({
          type: 'insert_node',
          path: [...path, 0],
          node: {
            text: 'empty',
          },
        });
        return true;
      }

      return false;
    };

    editor.children = [{ children: [] }] as any;
    editor.normalize = normalizeCurried(editor, [oneTextNode]);
    editor.normalize();

    expect(editor.children).toHaveLength(1);
    expect(editor.children).toMatchObject([
      {
        children: [{ text: 'empty' }],
      },
    ]);

    editor.apply({
      type: 'insert_node',
      path: [1],
      node: { children: [] } as any,
    });

    expect(editor.children).toHaveLength(2);
    expect(editor.children).toMatchObject([
      {
        children: [{ text: 'empty' }],
      },
      {
        children: [{ text: 'empty' }],
      },
    ]);
  });

  it('enforces a certain structure', () => {
    const structureNormalizer = (entry: NodeEntry): boolean => {
      const [node] = entry;
      if (!Editor.isEditor(node)) return false;

      if (editor.children.length === 0) {
        editor.apply({
          type: 'insert_node',
          path: [0],
          node: {
            type: 'title',
            children: [{ text: 'my-title' }],
          } as any,
        });
        return true;
      }

      const firstChild = editor.children[0] as any;

      if (firstChild.type !== 'title') {
        editor.apply({
          type: 'remove_node',
          path: [0],
          node: firstChild,
        });
        return true;
      }

      if (editor.children.length === 1) {
        editor.apply({
          type: 'insert_node',
          path: [1],
          node: {
            type: 'tab',
            children: [],
          } as any,
        });
        return true;
      }

      const secondChild = editor.children[1] as any;

      if (secondChild.type !== 'tab') {
        editor.apply({
          type: 'remove_node',
          path: [1],
          node: secondChild,
        });
        return true;
      }

      if (editor.children.length > 2) {
        editor.apply({
          type: 'remove_node',
          path: [2],
          node: editor.children[2],
        });
        return true;
      }

      return false;
    };

    editor.normalize = normalizeCurried(editor, [structureNormalizer]);

    editor.normalize();

    expect(editor.children).toHaveLength(2);
    expect(editor.children).toMatchObject([
      { type: 'title', children: [{ text: 'my-title' }] },
      { type: 'tab', children: [] },
    ]);
  });

  it('throws error if plugin is poorly written', () => {
    const infinitePlugin = () => {
      return true;
    };
    editor.normalize = normalizeCurried(editor, [infinitePlugin]);

    expect(() => editor.normalize()).toThrow();
  });
});
