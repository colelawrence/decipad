import { ELEMENT_EXPRESSION } from '@decipad/editor-types';
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
import { Expression } from './Expression';

let plateProps: PlateProps;
let editor: PlateEditor;
beforeEach(() => {
  const inputPlugin: PlatePlugin = {
    key: ELEMENT_EXPRESSION,
    isElement: true,
    component: Expression,
  };
  const plugins = createPlugins([inputPlugin]);
  plateProps = {
    plugins,
    editableProps: { scrollSelectionIntoView: noop },
    initialValue: [
      {
        type: ELEMENT_EXPRESSION,
        children: [{ text: 'expression' }],
      },
    ],
  };
  editor = createPlateEditor(plateProps);
});

it('renders the element properties', () => {
  const { getByText } = render(<Plate {...plateProps} editor={editor} />);

  expect(getByText('expression')).toBeVisible();
});
