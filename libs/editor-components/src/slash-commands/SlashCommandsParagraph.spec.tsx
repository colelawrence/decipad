import { PropsWithChildren } from 'react';
import {
  createPlateEditor,
  createParagraphPlugin,
  createPlugins,
  Plate,
  PlateEditor,
  PlateProps,
} from '@udecode/plate';
import userEvent from '@testing-library/user-event';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { findParentWithStyle } from '@decipad/dom-test-utils';
import { ELEMENT_H3, ELEMENT_PARAGRAPH } from '@decipad/editor-types';
import { noop } from '@decipad/utils';
import {
  act,
  getDefaultNormalizer,
  render,
  waitFor,
} from '@testing-library/react';
import { findDomNodePath } from '@decipad/editor-utils';
import { SlashCommandsParagraph } from './SlashCommandsParagraph';

let editor: PlateEditor;
let plateProps: PlateProps;
let wrapper: React.FC<PropsWithChildren<unknown>>;
beforeEach(() => {
  const plugins = createPlugins([createParagraphPlugin()], {
    components: {
      [ELEMENT_PARAGRAPH]: SlashCommandsParagraph,
    },
  });

  plateProps = {
    editableProps: { scrollSelectionIntoView: noop },
    initialValue: [{ type: ELEMENT_PARAGRAPH, children: [{ text: '/' }] }],
    plugins,
  };

  editor = createPlateEditor(plateProps);

  wrapper = ({ children }) => (
    <DndProvider backend={HTML5Backend}>{children}</DndProvider>
  );
});

it('renders the menu when typing in the selected paragraph starting with a /', async () => {
  const { getByText, findByText } = render(
    <Plate {...plateProps} editor={editor} />,
    {
      wrapper,
    }
  );

  act(() => {
    ReactEditor.focus(editor);
  });
  Transforms.select(editor, {
    path: findDomNodePath(editor, getByText('/')),
    offset: '/'.length,
  });
  Transforms.insertText(editor, 'a');

  await findByText('/a');
  expect(getByText(/sub-head/i)).toBeVisible();
});
it('does not render the menu when the editor is not focused', async () => {
  const { getByText, queryByText, findByText } = render(
    <Plate {...plateProps} editor={editor} />,
    { wrapper }
  );

  Transforms.select(editor, {
    path: findDomNodePath(editor, getByText('/')),
    offset: '/'.length,
  });
  Transforms.insertText(editor, 'a');

  await findByText('/a');
  expect(queryByText(/sub-head/i)).not.toBeInTheDocument();
});
it('does not render the menu when the paragraph is not selected', async () => {
  const { getByText, queryByText, findByText } = render(
    <Plate {...plateProps} editor={editor} />,
    { wrapper }
  );

  act(() => {
    ReactEditor.focus(editor);
  });
  Transforms.insertText(editor, 'a', {
    at: {
      path: findDomNodePath(editor, getByText('/')),
      offset: '/'.length,
    },
  });

  await findByText('/a');
  expect(queryByText(/sub-head/i)).not.toBeInTheDocument();
});
it('does not render the menu before typing', async () => {
  const { getByText, queryByText, findByText } = render(
    <Plate {...plateProps} editor={editor} />,
    { wrapper }
  );

  act(() => {
    ReactEditor.focus(editor);
  });
  Transforms.select(editor, {
    path: findDomNodePath(editor, getByText('/')),
    offset: '/'.length,
  });

  await findByText('/');
  expect(queryByText(/sub-head/i)).not.toBeInTheDocument();
});
it.each([' /cmd', '/cmd#', '/42'])(
  'does not render the menu for the non-command text "%s"',
  async (text) => {
    const { getByText, queryByText, findByText } = render(
      <Plate {...plateProps} editor={editor} />,
      { wrapper }
    );

    act(() => {
      ReactEditor.focus(editor);
    });
    const textPath = findDomNodePath(editor, getByText('/'));
    Transforms.select(editor, {
      anchor: {
        path: textPath,
        offset: 0,
      },
      focus: {
        path: textPath,
        offset: '/'.length,
      },
    });
    Transforms.insertText(editor, text);

    await findByText(text, {
      normalizer: getDefaultNormalizer({ trim: false }),
    });
    expect(queryByText(/sub-head/i)).not.toBeInTheDocument();
  }
);

describe('the menu', () => {
  it('is scrolled into view on opening', async () => {
    const { getByText, findByText } = render(
      <Plate {...plateProps} editor={editor} />,
      {
        wrapper,
      }
    );

    act(() => {
      ReactEditor.focus(editor);
    });
    Transforms.select(editor, {
      path: findDomNodePath(editor, getByText('/')),
      offset: '/'.length,
    });
    Transforms.insertText(editor, 'a');

    await findByText('/a');
    expect(
      findParentWithStyle(getByText(/sub-head/i), 'zIndex')!.element
        .scrollIntoView
    ).toHaveBeenCalled();
  });

  it('is scrolled into view when typing', async () => {
    const { getByText, findByText } = render(
      <Plate {...plateProps} editor={editor} />,
      {
        wrapper,
      }
    );

    act(() => {
      ReactEditor.focus(editor);
    });
    Transforms.select(editor, {
      path: findDomNodePath(editor, getByText('/')),
      offset: '/'.length,
    });
    Transforms.insertText(editor, 'a');

    await findByText('/a');
    const menuElement = findParentWithStyle(
      getByText(/sub-head/i),
      'zIndex'
    )!.element;
    menuElement.scrollIntoView = jest.fn();

    Transforms.insertText(editor, 'b');
    await findByText('/ab');
    expect(menuElement.scrollIntoView).toHaveBeenCalled();
  });
});

describe('the escape key', () => {
  it('hides the menu until typing again', async () => {
    const { getByText, queryByText, findByText } = render(
      <Plate {...plateProps} editor={editor} />,
      { wrapper }
    );

    act(() => {
      ReactEditor.focus(editor);
    });
    Transforms.select(editor, {
      path: findDomNodePath(editor, getByText('/')),
      offset: '/'.length,
    });
    Transforms.insertText(editor, 'a');
    await findByText(/sub-head/i);

    await userEvent.keyboard('{Escape}');
    expect(queryByText(/sub-head/i)).not.toBeInTheDocument();

    Transforms.insertText(editor, 'd');
    expect(await findByText(/sub-head/i)).toBeVisible();
  });

  it('does not hide the menu while holding shift', async () => {
    const { getByText, findByText } = render(
      <Plate {...plateProps} editor={editor} />,
      {
        wrapper,
      }
    );

    act(() => {
      ReactEditor.focus(editor);
    });
    Transforms.select(editor, {
      path: findDomNodePath(editor, getByText('/')),
      offset: '/'.length,
    });
    Transforms.insertText(editor, 'a');
    await findByText(/sub-head/i);

    await userEvent.keyboard('{Shift>}{Escape}');
    expect(getByText(/sub-head/i)).toBeVisible();
  });
});

it('executes a command on click', async () => {
  const { getByText, findByText } = render(
    <Plate {...plateProps} editor={editor} />,
    {
      wrapper,
    }
  );

  act(() => {
    ReactEditor.focus(editor);
  });
  Transforms.select(editor, {
    path: findDomNodePath(editor, getByText('/')),
    offset: '/'.length,
  });
  Transforms.insertText(editor, 'a');

  await userEvent.click(await findByText(/sub-head/i));
  await waitFor(() => {
    expect(editor.children).toEqual([
      { type: ELEMENT_H3, children: [{ text: '' }] },
    ]);
  });
});

it('uses the text after the slash to search for commands', async () => {
  const { getByText, queryByText, findByText } = render(
    <Plate {...plateProps} editor={editor} />,
    { wrapper }
  );

  act(() => {
    ReactEditor.focus(editor);
  });
  Transforms.select(editor, {
    path: findDomNodePath(editor, getByText('/')),
    offset: '/'.length,
  });
  Transforms.insertText(editor, 'secondary');

  expect(await findByText(/secondary.+heading/i)).toBeVisible();
  expect(queryByText(/calculation/i)).not.toBeInTheDocument();
});
