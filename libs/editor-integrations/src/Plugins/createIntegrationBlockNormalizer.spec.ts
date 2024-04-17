import {
  ELEMENT_INTEGRATION,
  createMyPlateEditor,
} from '@decipad/editor-types';
import { nanoid } from 'nanoid';
import { createNormalizeIntegrationBlock } from './createIntegrationBlockNormalizer';

describe('Create Integration Block Normalizer', () => {
  let editor = createMyPlateEditor();

  beforeEach(() => {
    editor = createMyPlateEditor({
      plugins: [createNormalizeIntegrationBlock],
    });
  });

  it('Adds typeMappings if missing from block', () => {
    editor.children = [
      {
        type: ELEMENT_INTEGRATION,
        id: nanoid(),
        children: [{ text: '' }],
        integrationType: {},
      } as any,
    ];

    editor.normalize({ force: true });

    expect(editor.children).toMatchObject([
      {
        children: [
          {
            text: '',
          },
        ],
        id: expect.any(String),
        typeMappings: [],
        integrationType: {},
        type: 'integration-block',
      },
    ]);
  });

  it('Notion: Changes URL from old format to new', () => {
    editor.children = [
      {
        type: ELEMENT_INTEGRATION,
        id: nanoid(),
        children: [{ text: '' }],
        typeMappings: [],
        latestResult: 'result',
        timeOfLastRun: 'bruh',
        integrationType: {
          type: 'notion',
          notionUrl:
            'https://www.notion.so/56a46e9f8d6d49e082641b7bd081fe65?v=32db954931114b7f861ab7bb707233fb&pvs=4',
        },
      } as any,
    ];

    editor.normalize({ force: true });

    expect(editor.children).toMatchObject([
      {
        children: [
          {
            text: '',
          },
        ],
        id: expect.any(String),
        typeMappings: [],
        type: 'integration-block',
        latestResult: 'result',
        timeOfLastRun: 'bruh',
        integrationType: {
          type: 'notion',
          notionUrl: `${window.location.origin}/api/externaldatasources/notion/56a46e9f8d6d49e082641b7bd081fe65/data`,
          externalDataId: '',
          externalDataName: '',
          databaseName: '',
        },
      },
    ]);
  });

  it('Notion: Changes URL from other origins to current origin', () => {
    editor.children = [
      {
        type: ELEMENT_INTEGRATION,
        id: nanoid(),
        children: [{ text: '' }],
        typeMappings: [],
        latestResult: 'result',
        timeOfLastRun: 'bruh',
        integrationType: {
          type: 'notion',
          notionUrl:
            'https://dev.decipad.com/api/externaldatasources/notion/56a46e9f8d6d49e082641b7bd081fe65/data',
        } as any,
      },
    ];

    editor.normalize({ force: true });

    expect(editor.children).toMatchObject([
      {
        children: [
          {
            text: '',
          },
        ],
        id: expect.any(String),
        typeMappings: [],
        type: 'integration-block',
        latestResult: 'result',
        timeOfLastRun: 'bruh',
        integrationType: {
          type: 'notion',
          notionUrl: `${window.location.origin}/api/externaldatasources/notion/56a46e9f8d6d49e082641b7bd081fe65/data`,
          externalDataId: '',
          externalDataName: '',
          databaseName: '',
        },
      },
    ]);
  });

  it('fix latestResult and time of last run move', () => {
    editor.children = [
      {
        type: ELEMENT_INTEGRATION,
        id: nanoid(),
        children: [{ text: '' }],
        typeMappings: [],
        integrationType: {
          type: 'notion',
          latestResult: 'result',
          timeOfLastRun: 'bruh',
          notionUrl:
            'https://dev.decipad.com/api/externaldatasources/notion/56a46e9f8d6d49e082641b7bd081fe65/data',
        },
      } as any,
    ];

    editor.normalize({ force: true });

    expect(editor.children).toMatchObject([
      {
        children: [
          {
            text: '',
          },
        ],
        integrationType: {
          databaseName: '',
          externalDataId: '',
          externalDataName: '',
          notionUrl:
            'http://localhost/api/externaldatasources/notion/56a46e9f8d6d49e082641b7bd081fe65/data',
          type: 'notion',
        },
        latestResult: 'result',
        timeOfLastRun: 'bruh',
        type: 'integration-block',
        typeMappings: [],
      },
    ]);
  });
});
