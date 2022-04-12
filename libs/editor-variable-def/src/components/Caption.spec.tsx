import { ELEMENT_CAPTION } from '@decipad/editor-types';
import { noop } from '@decipad/utils';
import { render } from '@testing-library/react';
import {
  createPlateEditor,
  createPlugins,
  Plate,
  PlateEditor,
  PlatePlugin,
  PlateProps,
} from '@udecode/plate';
import { Caption } from './Caption';

let plateProps: PlateProps;
let editor: PlateEditor;
beforeEach(() => {
  const inputPlugin: PlatePlugin = {
    key: ELEMENT_CAPTION,
    isElement: true,
    component: Caption,
  };
  const plugins = createPlugins([inputPlugin]);
  plateProps = {
    plugins,
    editableProps: { scrollSelectionIntoView: noop },
    initialValue: [
      {
        type: ELEMENT_CAPTION,
        children: [{ text: 'var' }],
      },
    ],
  };
  editor = createPlateEditor(plateProps);
});

it('renders the element properties', () => {
  const { getByText } = render(<Plate {...plateProps} editor={editor} />);

  expect(getByText('var')).toBeVisible();
});
