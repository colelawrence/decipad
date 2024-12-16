import { beforeEach, expect, describe, it } from 'vitest';
import {
  ELEMENT_TIME_SERIES,
  createMyPlateEditor,
} from '@decipad/editor-types';
import type { TEditor } from '@udecode/plate-common';
import { normalizeEditor } from '@udecode/plate-common';
import { createNormalizeTimeSeriesPlugin } from './createNormalizeTimeSeriesPlugin';

describe('createNormalizeTimeSeriesPlugin', () => {
  let editor: TEditor;
  beforeEach(() => {
    editor = createMyPlateEditor({
      plugins: [createNormalizeTimeSeriesPlugin()],
    });
  });

  it('normalizes', () => {
    editor.children = [
      {
        type: ELEMENT_TIME_SERIES,
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
                children: [{ text: '' }],
                type: 'data-view-name',
              },
            ],
            type: 'data-view-caption',
          },
          {
            children: [{ text: '' }],
            type: 'time-series-tr',
          },
        ],
        type: 'time-series',
      },
    ]);
  });
});
