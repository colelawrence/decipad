import { ELEMENT_CAPTION } from '@decipad/editor-types';
import { noop } from '@decipad/utils';
import { render } from '@testing-library/react';
import type {
  PlateEditor,
  PlatePlugin,
  PlateProps,
} from '@udecode/plate-common';
import {
  createPlateEditor,
  createPlugins,
  Plate,
  PlateContent,
} from '@udecode/plate-common';
import { Caption } from './Caption';
import { ToastDisplay } from '@decipad/ui';

let plateProps: Omit<PlateProps, 'children'>;
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
    initialValue: [
      {
        type: ELEMENT_CAPTION,
        children: [{ text: 'var' }],
      },
    ],
  };
  editor = createPlateEditor({ plugins });
});

it('renders the element properties', () => {
  const { getByText } = render(
    <ToastDisplay>
      <Plate {...plateProps} editor={editor}>
        <PlateContent scrollSelectionIntoView={noop} />
      </Plate>
    </ToastDisplay>
  );

  expect(getByText('var')).toBeVisible();
});
