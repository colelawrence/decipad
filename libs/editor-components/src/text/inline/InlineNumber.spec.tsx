import { render, screen, waitFor } from '@testing-library/react';
import {
  createPlateEditor,
  createPlugins,
  Plate,
  PlateEditor,
  PlateProps,
} from '@udecode/plate';
import {
  ELEMENT_INLINE_NUMBER,
  ELEMENT_PARAGRAPH,
} from '@decipad/editor-types';
import { noop } from '@decipad/utils';
import { PropsWithChildren } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { InlineNumber } from '.';
import { Paragraph } from '../Paragraph';

it('Renders children', async () => {
  render(<Plate {...plateProps} editor={editor} />, {
    wrapper,
  });
  await waitFor(() => {
    expect(screen.getByText('20 apples')).not.toBeNull();
  });
});

let plateProps: PlateProps;
let editor: PlateEditor;
beforeEach(() => {
  const plugins = createPlugins([], {
    components: {
      [ELEMENT_PARAGRAPH]: Paragraph,
      [ELEMENT_INLINE_NUMBER]: InlineNumber,
    },
  });
  plateProps = {
    editableProps: { scrollSelectionIntoView: noop },
    initialValue: [
      {
        type: ELEMENT_PARAGRAPH,
        children: [
          { text: 'We have ' },
          {
            type: ELEMENT_INLINE_NUMBER,
            name: 'apples',
            children: [{ text: '20 apples' }],
          },
        ],
      },
    ],
    plugins,
  };
  editor = createPlateEditor({ plugins });
});

const wrapper: React.FC<PropsWithChildren<unknown>> = ({ children }) => (
  <DndProvider backend={HTML5Backend}>{children}</DndProvider>
);
