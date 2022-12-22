import {
  ELEMENT_H1,
  ELEMENT_PARAGRAPH,
  H1Element,
  MyEditor,
  ParagraphElement,
} from '@decipad/editor-types';
import { createPlateEditor } from '@udecode/plate';
import { nanoid } from 'nanoid';
import { insertNodes } from './insertNodes';
import { mutateText } from './mutateText';

describe('mutateText', () => {
  it('leaves text unchanged', () => {
    const h1: H1Element = {
      id: nanoid(),
      type: ELEMENT_H1,
      children: [{ text: 'title' }],
    };
    const p: ParagraphElement = {
      id: nanoid(),
      type: 'p',
      children: [{ text: 'hey' }],
    };
    const editor = createPlateEditor() as MyEditor;
    insertNodes(editor, [h1, p]);
    mutateText(editor, [1])('hey');
    expect(editor.children[1]).toBe(p);
  });

  it('adds to the beginning', () => {
    const editor = createPlateEditor() as MyEditor;
    const h1: H1Element = {
      id: nanoid(),
      type: ELEMENT_H1,
      children: [{ text: 'hey' }],
    };
    const p: ParagraphElement = {
      id: nanoid(),
      type: ELEMENT_PARAGRAPH,
      children: [{ text: 'hey' }],
    };
    insertNodes(editor, [h1, p]);
    mutateText(editor, [1])('oh hey');
    expect(editor.children[1].children[0].text).toEqual('oh hey');
  });

  it('adds to the end', () => {
    const editor = createPlateEditor() as MyEditor;
    const h1: H1Element = {
      id: nanoid(),
      type: ELEMENT_H1,
      children: [{ text: 'hey' }],
    };
    const p: ParagraphElement = {
      id: nanoid(),
      type: ELEMENT_PARAGRAPH,
      children: [{ text: 'hey' }],
    };
    insertNodes(editor, [h1, p]);
    mutateText(editor, [1])('hey there!');
    expect(editor.children[1].children[0].text).toEqual('hey there!');
  });

  it('adds in the middle', () => {
    const editor = createPlateEditor() as MyEditor;
    const h1: H1Element = {
      id: nanoid(),
      type: ELEMENT_H1,
      children: [{ text: 'hey' }],
    };
    const p: ParagraphElement = {
      id: nanoid(),
      type: ELEMENT_PARAGRAPH,
      children: [{ text: 'hey' }],
    };
    insertNodes(editor, [h1, p]);
    mutateText(editor, [1])('heeeeeey');
    expect(editor.children[1].children[0].text).toEqual('heeeeeey');
  });

  it('adds everywhere', () => {
    const editor = createPlateEditor() as MyEditor;
    const h1: H1Element = {
      id: nanoid(),
      type: ELEMENT_H1,
      children: [{ text: 'hey' }],
    };
    const p: ParagraphElement = {
      id: nanoid(),
      type: ELEMENT_PARAGRAPH,
      children: [{ text: 'hey' }],
    };
    insertNodes(editor, [h1, p]);
    mutateText(editor, [1])('AhBeCyD');
    expect(editor.children[1].children[0].text).toEqual('AhBeCyD');
  });

  it('can remove at the beginning', () => {
    const editor = createPlateEditor() as MyEditor;
    const h1: H1Element = {
      id: nanoid(),
      type: ELEMENT_H1,
      children: [{ text: 'hey' }],
    };
    const p: ParagraphElement = {
      id: nanoid(),
      type: ELEMENT_PARAGRAPH,
      children: [{ text: 'hey' }],
    };
    insertNodes(editor, [h1, p]);
    mutateText(editor, [1])('ey');
    expect(editor.children[1].children[0].text).toEqual('ey');
  });

  it('can remove at the end', () => {
    const editor = createPlateEditor() as MyEditor;
    const h1: H1Element = {
      id: nanoid(),
      type: ELEMENT_H1,
      children: [{ text: 'hey' }],
    };
    const p: ParagraphElement = {
      id: nanoid(),
      type: ELEMENT_PARAGRAPH,
      children: [{ text: 'hey' }],
    };
    insertNodes(editor, [h1, p]);
    mutateText(editor, [1])('he');
    expect(editor.children[1].children[0].text).toEqual('he');
  });

  it('can remove in the middle', () => {
    const editor = createPlateEditor() as MyEditor;
    const h1: H1Element = {
      id: nanoid(),
      type: ELEMENT_H1,
      children: [{ text: 'hey' }],
    };
    const p: ParagraphElement = {
      id: nanoid(),
      type: ELEMENT_PARAGRAPH,
      children: [{ text: 'hey' }],
    };
    insertNodes(editor, [h1, p]);
    mutateText(editor, [1])('hy');
    expect(editor.children[1].children[0].text).toEqual('hy');
  });

  it('can combine additions and removals', () => {
    const editor = createPlateEditor() as MyEditor;
    const h1: H1Element = {
      id: nanoid(),
      type: ELEMENT_H1,
      children: [{ text: 'hey' }],
    };
    const p: ParagraphElement = {
      id: nanoid(),
      type: ELEMENT_PARAGRAPH,
      children: [{ text: 'hey' }],
    };
    insertNodes(editor, [h1, p]);
    mutateText(editor, [1])('AAhDDDyEEE');
    expect(editor.children[1].children[0].text).toEqual('AAhDDDyEEE');
  });

  it('can change the whole thnig entirely', () => {
    const editor = createPlateEditor() as MyEditor;
    const h1: H1Element = {
      id: nanoid(),
      type: ELEMENT_H1,
      children: [{ text: 'hey' }],
    };
    const p: ParagraphElement = {
      id: nanoid(),
      type: ELEMENT_PARAGRAPH,
      children: [{ text: 'hey' }],
    };
    insertNodes(editor, [h1, p]);
    mutateText(editor, [1])('good');
    expect(editor.children[1].children[0].text).toEqual('good');
  });
});
