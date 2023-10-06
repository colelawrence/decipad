import {
  ELEMENT_CAPTION,
  ELEMENT_EXPRESSION,
  ELEMENT_SLIDER,
  ELEMENT_VARIABLE_DEF,
} from '@decipad/editor-types';
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
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { VariableDef } from './VariableDef';
import { BrowserRouter } from 'react-router-dom';

describe('Variable def expression element', () => {
  let plateProps: PlateProps;
  let editor: PlateEditor;
  let wrapper: React.FC<
    React.PropsWithChildren<React.PropsWithChildren<unknown>>
  >;
  beforeEach(() => {
    const inputPlugin: PlatePlugin = {
      key: ELEMENT_VARIABLE_DEF,
      isElement: true,
      component: VariableDef,
    };
    const plugins = createPlugins([inputPlugin]);
    plateProps = {
      plugins,
      editableProps: { scrollSelectionIntoView: noop },
      initialValue: [
        {
          type: 'foo',
          children: [{ text: '' }],
        },
        {
          type: ELEMENT_VARIABLE_DEF,
          variant: 'expression',
          children: [
            {
              type: ELEMENT_CAPTION,
              children: [{ text: 'var' }],
            },
            {
              type: ELEMENT_EXPRESSION,
              children: [{ text: '10' }],
            },
          ],
        },
      ],
    };
    editor = createPlateEditor({
      plugins,
    });

    wrapper = ({ children }) => (
      <DndProvider backend={HTML5Backend}>
        <BrowserRouter>{children}</BrowserRouter>
      </DndProvider>
    );
  });

  it('renders the element properties', () => {
    const { getByText } = render(<Plate {...plateProps} editor={editor} />, {
      wrapper,
    });

    expect(getByText('var')).toBeVisible();
    expect(getByText('10')).toBeVisible();
  });
});

describe('Variable def slider element', () => {
  let plateProps: PlateProps;
  let editor: PlateEditor;
  let wrapper: React.FC<
    React.PropsWithChildren<React.PropsWithChildren<unknown>>
  >;
  beforeEach(() => {
    const inputPlugin: PlatePlugin = {
      key: ELEMENT_VARIABLE_DEF,
      isElement: true,
      component: VariableDef,
    };
    const plugins = createPlugins([inputPlugin]);
    plateProps = {
      plugins,
      editableProps: { scrollSelectionIntoView: noop },
      initialValue: [
        {
          type: ELEMENT_VARIABLE_DEF,
          variant: 'slider',
          children: [
            {
              type: ELEMENT_CAPTION,
              children: [{ text: 'var' }],
            },
            {
              type: ELEMENT_EXPRESSION,
              children: [{ text: '5' }],
            },
            {
              type: ELEMENT_SLIDER,
              max: '10',
              min: '0',
              step: '0.1',
              value: '5',
              children: [{ text: '' }],
            },
          ],
        },
      ],
    };
    editor = createPlateEditor({
      plugins,
    });

    wrapper = ({ children }) => (
      <DndProvider backend={HTML5Backend}>
        <BrowserRouter>{children}</BrowserRouter>
      </DndProvider>
    );
  });

  it('renders the element properties', () => {
    const { getByText } = render(<Plate {...plateProps} editor={editor} />, {
      wrapper,
    });

    expect(getByText('var')).toBeVisible();
  });
});
