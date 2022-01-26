import { noop } from '@decipad/utils';
import {
  act,
  getDefaultNormalizer,
  render,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  createEditorPlugins,
  Plate,
  createParagraphPlugin,
  PlateProps,
  SPEditor,
  PlatePluginComponent,
} from '@udecode/plate';
import { Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { findDomNodePath } from '../../utils/slateReact';
import { SlashCommandsParagraph } from './SlashCommandsParagraph';
import { ELEMENT_PARAGRAPH, ELEMENT_H2 } from '../../elements';

let editor: SPEditor & ReactEditor;
let plateProps: PlateProps;
beforeEach(() => {
  editor = createEditorPlugins();
  plateProps = {
    editor,
    editableProps: { scrollSelectionIntoView: noop },
    initialValue: [{ type: ELEMENT_PARAGRAPH, children: [{ text: '/' }] }],
    plugins: [createParagraphPlugin()],
    components: {
      [ELEMENT_PARAGRAPH]: SlashCommandsParagraph as PlatePluginComponent,
    },
  };
});

it('renders the menu when typing in the selected paragraph starting with a /', async () => {
  const { getByText, findByText } = render(<Plate {...plateProps} />);

  act(() => {
    ReactEditor.focus(editor);
  });
  Transforms.select(editor, {
    path: findDomNodePath(editor, getByText('/')),
    offset: '/'.length,
  });
  Transforms.insertText(editor, 'a');

  await findByText('/a');
  expect(getByText(/heading.*1/i)).toBeVisible();
});
it('does not render the menu when the editor is not focused', async () => {
  const { getByText, queryByText, findByText } = render(
    <Plate {...plateProps} />
  );

  Transforms.select(editor, {
    path: findDomNodePath(editor, getByText('/')),
    offset: '/'.length,
  });
  Transforms.insertText(editor, 'a');

  await findByText('/a');
  expect(queryByText(/heading.*1/i)).not.toBeInTheDocument();
});
it('does not render the menu when the paragraph is not selected', async () => {
  const { getByText, queryByText, findByText } = render(
    <Plate {...plateProps} />
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
  expect(queryByText(/heading.*1/i)).not.toBeInTheDocument();
});
it('does not render the menu before typing', async () => {
  const { getByText, queryByText, findByText } = render(
    <Plate {...plateProps} />
  );

  act(() => {
    ReactEditor.focus(editor);
  });
  Transforms.select(editor, {
    path: findDomNodePath(editor, getByText('/')),
    offset: '/'.length,
  });

  await findByText('/');
  expect(queryByText(/heading.*1/i)).not.toBeInTheDocument();
});
it.each([' /cmd', '/cmd#', '/42'])(
  'does not render the menu for the non-command text "%s"',
  async (text) => {
    const { getByText, queryByText, findByText } = render(
      <Plate {...plateProps} />
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
    expect(queryByText(/heading.*1/i)).not.toBeInTheDocument();
  }
);

describe('the escape key', () => {
  it('hides the menu until typing again', async () => {
    const { getByText, queryByText, findByText } = render(
      <Plate {...plateProps} />
    );

    act(() => {
      ReactEditor.focus(editor);
    });
    Transforms.select(editor, {
      path: findDomNodePath(editor, getByText('/')),
      offset: '/'.length,
    });
    Transforms.insertText(editor, 'a');
    await findByText(/heading.*1/i);

    userEvent.keyboard('{esc}');
    expect(queryByText(/heading.*1/i)).not.toBeInTheDocument();

    Transforms.insertText(editor, 'd');
    expect(await findByText(/heading.*1/i)).toBeVisible();
  });

  it('does not hide the menu while holding shift', async () => {
    const { getByText, findByText } = render(<Plate {...plateProps} />);

    act(() => {
      ReactEditor.focus(editor);
    });
    Transforms.select(editor, {
      path: findDomNodePath(editor, getByText('/')),
      offset: '/'.length,
    });
    Transforms.insertText(editor, 'a');
    await findByText(/heading.*1/i);

    userEvent.keyboard('{shift}{esc}');
    expect(getByText(/heading.*1/i)).toBeVisible();
  });
});

it('executes a command on click', async () => {
  const { getByText, findByText } = render(<Plate {...plateProps} />);

  act(() => {
    ReactEditor.focus(editor);
  });
  Transforms.select(editor, {
    path: findDomNodePath(editor, getByText('/')),
    offset: '/'.length,
  });
  Transforms.insertText(editor, 'a');

  userEvent.click(await findByText(/heading.*1/i));
  await waitFor(() => {
    expect(editor.children).toEqual([
      { type: ELEMENT_H2, children: [{ text: '' }] },
    ]);
  });
});

it('uses the text after the slash to search for commands', async () => {
  const { getByText, queryByText, findByText } = render(
    <Plate {...plateProps} />
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
