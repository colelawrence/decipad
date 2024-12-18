import { createMigrateDisplayPlugin } from './createMigrateDisplayPlugin';
import { expect, it } from 'vitest';
import {
  DisplayElement,
  ELEMENT_DISPLAY,
  ELEMENT_METRIC,
  MetricElement,
  createMyPlateEditor,
} from '@decipad/editor-types';
import { normalizeEditor } from '@udecode/plate-common';

const editor = createMyPlateEditor({
  plugins: [createMigrateDisplayPlugin()],
});

it('converts display element to metric element', () => {
  const displayElement: DisplayElement = {
    type: ELEMENT_DISPLAY,
    id: '1',
    blockId: '2',
    varName: 'MyVariable',
    color: 'Sun',
    formatting: 'scientific',
    icon: 'MyIcon',
    children: [{ text: '' }],
  };
  editor.children = [displayElement];
  normalizeEditor(editor, { force: true });
  expect(editor.children).toEqual([
    {
      type: ELEMENT_METRIC,
      id: '1',
      blockId: '2',
      caption: 'MyVariable',
      comparisonBlockId: '',
      comparisonDescription: '',
      color: 'Sun',
      formatting: 'scientific',
      migratedFromDisplayElement: displayElement,
      children: [{ text: '' }],
    } satisfies MetricElement,
  ]);
});

it('converts minimal display element to metric element', () => {
  const displayElement: DisplayElement = {
    type: ELEMENT_DISPLAY,
    id: '1',
    blockId: '',
    children: [{ text: '' }],
  };
  editor.children = [displayElement];
  normalizeEditor(editor, { force: true });
  expect(editor.children).toEqual([
    {
      type: ELEMENT_METRIC,
      id: '1',
      blockId: '',
      caption: 'Metric',
      comparisonBlockId: '',
      comparisonDescription: '',
      migratedFromDisplayElement: displayElement,
      children: [{ text: '' }],
    } satisfies MetricElement,
  ]);
});
