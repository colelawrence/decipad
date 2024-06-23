import {
  ELEMENT_INTEGRATION,
  createMyPlateEditor,
} from '@decipad/editor-types';
import { createNormalizeIntegrationBlock } from './IntegrationBlockNormalizer';

describe('Create Integration Block Normalizer', () => {
  let editor = createMyPlateEditor();

  beforeEach(() => {
    editor = createMyPlateEditor({
      plugins: [createNormalizeIntegrationBlock],
    });
  });

  it('normalizes block children', () => {
    editor.children = [
      {
        type: ELEMENT_INTEGRATION,
        children: [
          { type: 'something-else', children: [{ text: 'whatever' }] },
        ],
      } as any,

      {
        type: ELEMENT_INTEGRATION,
        children: [{ text: 'hello world' }, { text: 'i shouldnt be here' }],
      } as any,
    ];

    editor.normalize({ force: true });

    expect(editor.children).toMatchObject([
      {
        type: ELEMENT_INTEGRATION,
        children: [{ text: 'whatever' }],
      },
      {
        type: ELEMENT_INTEGRATION,
        children: [{ text: 'hello world' }],
      },
    ]);
  });

  it('adds missing properties to block and removes others', () => {
    editor.children = [
      {
        type: ELEMENT_INTEGRATION,
        children: [{ text: 'name' }],
      } as any,
    ];

    editor.normalize({ force: true });

    expect(editor.children).toMatchObject([
      {
        type: ELEMENT_INTEGRATION,
        children: [{ text: 'name' }],

        typeMappings: [],
        columnsToHide: [],
        isFirstRowHeader: false,
      },
    ]);

    expect(editor.children[0]).not.toHaveProperty('latestResult');
  });
});
