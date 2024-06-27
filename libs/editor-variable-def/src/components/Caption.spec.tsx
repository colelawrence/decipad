import { ELEMENT_CAPTION } from '@decipad/editor-types';
import { ToastDisplay } from '@decipad/ui';
import { noop } from '@decipad/utils';
import { render } from '@testing-library/react';
import type {
  PlateEditor,
  PlatePlugin,
  PlateProps,
} from '@udecode/plate-common';
import {
  Plate,
  PlateContent,
  createPlateEditor,
  createPlugins,
} from '@udecode/plate-common';
import { Caption } from './Caption';

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
  const { container } = render(
    <ToastDisplay>
      <Plate {...plateProps} editor={editor}>
        <PlateContent scrollSelectionIntoView={noop} />
      </Plate>
    </ToastDisplay>
  );

  const { innerHTML } = container;

  expect(innerHTML).toContain('data-testid="input-widget-name"');
  expect(innerHTML).toContain('var');
});
