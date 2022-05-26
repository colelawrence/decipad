import { normalizeEditor } from '@udecode/plate';
import { createTPlateEditor, ELEMENT_SLIDER } from '@decipad/editor-types';
import { createNormalizeSliderPlugin } from './createNormalizeSliderPlugin';

const expectedSliderElement = ({
  max = '10',
  min = '0',
  step = '1',
  value = '5',
} = {}) => ({
  type: ELEMENT_SLIDER,
  max,
  min,
  step,
  value,
  children: [{ text: '' }],
});

let editor: ReturnType<typeof createTPlateEditor>;
beforeEach(() => {
  editor = createTPlateEditor({
    plugins: [createNormalizeSliderPlugin()],
  });
});

it.each(['max', 'min', 'step', 'value'] as const)(
  'defaults %s property to the default value when invalid',
  (prop) => {
    editor.children = [expectedSliderElement({ [prop]: undefined }) as never];
    normalizeEditor(editor, { force: true });
    expect(editor.children).toMatchObject([expectedSliderElement()]);

    editor.children = [
      expectedSliderElement({ [prop]: 'not a value' }) as never,
    ];
    normalizeEditor(editor, { force: true });
    expect(editor.children).toMatchObject([expectedSliderElement()]);

    editor.children = [expectedSliderElement({ [prop]: 10 }) as never];
    normalizeEditor(editor, { force: true });
    expect(editor.children).toMatchObject([expectedSliderElement()]);
  }
);

it('normalizes value to be below max', () => {
  editor.children = [
    expectedSliderElement({ max: '10', value: '100' }) as never,
  ];
  normalizeEditor(editor, { force: true });
  expect(editor.children).toMatchObject([
    expectedSliderElement({ max: '10', value: '10' }),
  ]);
});

it('normalizes value to be above min', () => {
  editor.children = [expectedSliderElement({ min: '5', value: '0' }) as never];
  normalizeEditor(editor, { force: true });
  expect(editor.children).toMatchObject([
    expectedSliderElement({ min: '5', value: '5' }),
  ]);
});

it('normalizes value to be between min and max', () => {
  editor.children = [
    expectedSliderElement({ min: '5', max: '10', value: '0' }) as never,
  ];
  normalizeEditor(editor, { force: true });
  expect(editor.children).toMatchObject([
    expectedSliderElement({ min: '5', max: '10', value: '5' }),
  ]);

  editor.children = [
    expectedSliderElement({ min: '5', max: '10', value: '20' }) as never,
  ];
  normalizeEditor(editor, { force: true });
  expect(editor.children).toMatchObject([
    expectedSliderElement({ min: '5', max: '10', value: '10' }),
  ]);
});

it('does not normalize switched min and max', () => {
  editor.children = [
    expectedSliderElement({
      min: '10',
      max: '0',
      value: '-5',
      step: '2',
    }) as never,
  ];
  normalizeEditor(editor, { force: true });
  expect(editor.children).toMatchObject([
    expectedSliderElement({ min: '10', max: '0', value: '-5', step: '2' }),
  ]);

  editor.children = [
    expectedSliderElement({
      min: '10',
      max: '0',
      value: '11',
      step: '12',
    }) as never,
  ];
  normalizeEditor(editor, { force: true });
  expect(editor.children).toMatchObject([
    expectedSliderElement({ min: '10', max: '0', value: '11', step: '12' }),
  ]);
});

it('does not normalize step bigger than max', () => {
  editor.children = [
    expectedSliderElement({
      max: '10',
      step: '12',
    }) as never,
  ];
  normalizeEditor(editor, { force: true });
  expect(editor.children).toMatchObject([
    expectedSliderElement({ max: '10', step: '12' }),
  ]);
});
