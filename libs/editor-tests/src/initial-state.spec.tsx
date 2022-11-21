import { render } from '@testing-library/react';
import { nanoid } from 'nanoid';
import { createEditor } from './utils/createEditor';
import { EditorStack } from './utils/EditorStack';

describe('Initial editor state', () => {
  const { editor, computer } = createEditor('empty-notebook');
  render(
    <EditorStack notebookId={nanoid()} editor={editor} computer={computer} />
  );
  editor.apply({ type: 'insert_text', path: [0, 0], offset: 0, text: '' });

  it('Starts with H1 title and an empty paragraph', () => {
    expect(editor.children).toHaveLength(2);
  });

  it('Expects all nodes to have IDs', () => {
    editor.children.forEach((child) => expect(child).toHaveProperty('id'));
  });
});
