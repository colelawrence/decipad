import { createTPlateEditor, ELEMENT_DATA_VIEW } from '@decipad/editor-types';
import { normalizeEditor, TEditor } from '@udecode/plate';
import { createNormalizeDataViewPlugin } from './createNormalizeDataViewPlugin';

describe('createNormalizeDataViewPlugin', () => {
  let editor: TEditor;
  beforeEach(() => {
    editor = createTPlateEditor({
      plugins: [createNormalizeDataViewPlugin()],
    });
  });

  it('normalizes', () => {
    editor.children = [
      {
        type: ELEMENT_DATA_VIEW,
        children: [],
      },
    ];
    normalizeEditor(editor, { force: true });
    expect(editor.children).toMatchObject([
      {
        children: [
          {
            children: [
              {
                children: [
                  {
                    text: '',
                  },
                ],
                type: 'table-var-name',
              },
            ],
            type: 'table-caption',
          },
          {
            children: [
              {
                text: '',
              },
            ],
            type: 'data-view-tr',
          },
        ],
        type: 'data-view',
      },
    ]);
  });
});
