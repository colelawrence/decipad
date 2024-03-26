import {
  ColumnsElement,
  VariableDefinitionElement,
  createMyPlateEditor,
} from '@decipad/editor-types';
import { createNormalizeCaptionPlugin } from './createNormalizeCaptionPlugin';
import { getRemoteComputer } from '@decipad/remote-computer';

const getDef = (): VariableDefinitionElement => ({
  type: 'def',
  variant: 'expression',
  id: '1',
  children: [
    { type: 'caption', id: '2', children: [{ text: 'name' }] },
    { type: 'exp', id: '3', children: [{ text: '' }] },
  ],
});

describe('Normalize Caption Plugin', () => {
  let computer = getRemoteComputer();

  let editor = createMyPlateEditor({
    plugins: [createNormalizeCaptionPlugin(computer)()],
  });

  beforeEach(() => {
    computer = getRemoteComputer();
    editor = createMyPlateEditor({
      plugins: [createNormalizeCaptionPlugin(computer)()],
    });
  });

  it('removes extra children', () => {
    const def = getDef();
    for (let i = 0; i < 100; i++) {
      def.children[0].children.push({ text: 'another ' });
    }

    editor.children = [def];
    editor.normalize({ force: true });

    expect(editor.children[0]).toMatchObject({
      children: [
        {
          children: [
            {
              text: 'name',
            },
          ],
          id: '2',
          type: 'caption',
        },
        {
          children: [
            {
              text: '',
            },
          ],
          id: '3',
          type: 'exp',
        },
      ],
      id: '1',
      type: 'def',
      variant: 'expression',
    });
  });

  it('inserts a text node if none present, with appropriate name', () => {
    const def = getDef();
    def.children[0].children = [] as any;

    editor.children = [def];
    editor.normalize({ force: true });

    const editorDef = editor.children[0] as VariableDefinitionElement;

    expect(editorDef.children[0].children).toHaveLength(1);

    // 'Slider' is the default name for sliders
    expect(editorDef.children[0].children[0].text).toBe('Slider1');
  });

  it('inserts unique names', () => {
    const def1 = getDef();
    def1.children[0].children[0].text = '';

    const def2 = getDef();
    def2.children[0].children[0].text = '';

    editor.children = [def1, def2];
    editor.normalize({ force: true });

    const editorDef1 = editor.children[0] as VariableDefinitionElement;
    const editorDef2 = editor.children[1] as VariableDefinitionElement;

    // 'Slider' is the default name for sliders
    expect(editorDef1.children[0].children[0].text).toBe('Slider1');
    expect(editorDef2.children[0].children[0].text).toBe('Slider2');
  });

  it('inserts unique names in columns', () => {
    const def1 = getDef();
    def1.children[0].children[0].text = '';

    const def2 = getDef();
    def2.children[0].children[0].text = '';

    const col: ColumnsElement = {
      type: 'columns',
      id: 'col',
      children: [def1, def2],
    };

    editor.children = [col];
    editor.normalize({ force: true });

    const editorCol = editor.children[0] as ColumnsElement;

    // 'Slider' is the default name for sliders
    expect(editorCol.children[0].children[0].children[0].text).toBe(
      'Col1Slider1'
    );
    expect(editorCol.children[1].children[0].children[0].text).toBe(
      'Col1Slider2'
    );
  });
});
