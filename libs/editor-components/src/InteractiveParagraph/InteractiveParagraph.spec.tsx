import { PropsWithChildren } from 'react';
import {
  createParagraphPlugin,
  createPlateEditor,
  createPlugins,
  ELEMENT_H3,
  focusEditor,
  insertText,
  Plate,
  PlateEditor,
  PlateProps,
  select,
} from '@udecode/plate';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { SessionProvider } from 'next-auth/react';
import { findParentWithStyle } from '@decipad/dom-test-utils';
import { ELEMENT_PARAGRAPH } from '@decipad/editor-types';
import { noop, timeout } from '@decipad/utils';
import { act, render, waitFor } from '@testing-library/react';
import { findDomNodePath } from '@decipad/editor-utils';
import { Computer } from '@decipad/computer';
import userEvent from '@testing-library/user-event';
import { InteractiveParagraph } from './InteractiveParagraph';

let editor: PlateEditor;
let plateProps: PlateProps;
let wrapper: React.FC<PropsWithChildren<unknown>>;
beforeEach(() => {
  const plugins = createPlugins([createParagraphPlugin()], {
    components: {
      [ELEMENT_PARAGRAPH]: InteractiveParagraph(new Computer()),
    },
  });

  plateProps = {
    editableProps: { scrollSelectionIntoView: noop },
    initialValue: [{ type: ELEMENT_PARAGRAPH, children: [{ text: '/' }] }],
    plugins,
  };

  editor = createPlateEditor({ plugins });

  wrapper = ({ children }) => (
    <SessionProvider
      session={{
        expires: new Date(Date.now() + 1000000).toISOString(),
        user: {
          name: 'userName',
          id: 'userid',
        },
      }}
    >
      <DndProvider backend={HTML5Backend}>{children}</DndProvider>
    </SessionProvider>
  );
});

it('renders the menu when typing in the selected paragraph starting with a /', async () => {
  const { getByText } = render(<Plate {...plateProps} editor={editor} />, {
    wrapper,
  });

  await act(async () => {
    focusEditor(editor);
    select(editor, {
      path: findDomNodePath(editor, getByText('/'))!,
      offset: '/'.length,
    });
    insertText(editor, 's');
    await timeout(500);
  });

  expect(getByText(/sub-head/i)).toBeVisible();
});

it('does not render the menu when the editor is not focused', async () => {
  const { getByText, queryByText } = render(
    <Plate {...plateProps} editor={editor} />,
    { wrapper }
  );

  await act(async () => {
    select(editor, {
      path: findDomNodePath(editor, getByText('/'))!,
      offset: '/'.length,
    });
    insertText(editor, 'a');
    await timeout(500);
  });

  expect(queryByText(/sub-head/i)).not.toBeInTheDocument();
});

it('does not render the menu when the paragraph is not selected', async () => {
  const { getByText, queryByText } = render(
    <Plate {...plateProps} editor={editor} />,
    { wrapper }
  );

  await act(async () => {
    focusEditor(editor);
    insertText(editor, 'h', {
      at: {
        path: findDomNodePath(editor, getByText('/'))!,
        offset: '/'.length,
      },
    });
    await timeout(500);
  });

  expect(queryByText(/sub-head/i)).not.toBeInTheDocument();
});

it('does not render the menu before typing', async () => {
  const { getByText, queryByText } = render(
    <Plate {...plateProps} editor={editor} />,
    { wrapper }
  );

  await act(async () => {
    focusEditor(editor);
    select(editor, {
      path: findDomNodePath(editor, getByText('/'))!,
      offset: '/'.length,
    });
    await timeout(500);
  });

  expect(queryByText(/sub-head/i)).not.toBeInTheDocument();
});

it.each([' /cmd', '/cmd#', '/42'])(
  'does not render the menu for the non-command text "%s"',
  async (text) => {
    const { getByText, queryByText } = render(
      <Plate {...plateProps} editor={editor} />,
      { wrapper }
    );

    await act(async () => {
      focusEditor(editor);
      const textPath = findDomNodePath(editor, getByText('/'))!;
      select(editor, {
        anchor: {
          path: textPath,
          offset: 0,
        },
        focus: {
          path: textPath,
          offset: '/'.length,
        },
      });
      insertText(editor, text);
      await timeout(500);
    });

    expect(queryByText(/sub-head/i)).not.toBeInTheDocument();
  }
);

describe('the menu', () => {
  it('is scrolled into view on opening', async () => {
    const { getByText } = render(<Plate {...plateProps} editor={editor} />, {
      wrapper,
    });

    await act(async () => {
      focusEditor(editor);
      select(editor, {
        path: findDomNodePath(editor, getByText('/'))!,
        offset: '/'.length,
      });
      insertText(editor, 'h');
      await timeout(500);
    });

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

    await act(async () => {
      focusEditor(editor);
      select(editor, {
        path: findDomNodePath(editor, getByText('/'))!,
        offset: '/'.length,
      });
      insertText(editor, 'h');
      await timeout(500);
    });
    await findByText('/h');

    const menuElement = findParentWithStyle(
      getByText(/sub-head/i),
      'zIndex'
    )!.element;

    await act(async () => {
      menuElement.scrollIntoView = jest.fn();

      insertText(editor, 'b');
      await timeout(500);
    });

    expect(menuElement.scrollIntoView).toHaveBeenCalled();
  });
});

describe('the escape key', () => {
  it('hides the menu until typing again', async () => {
    const { getByText, queryByText, findByText } = render(
      <Plate {...plateProps} editor={editor} />,
      { wrapper }
    );

    await act(async () => {
      focusEditor(editor);
      select(editor, {
        path: findDomNodePath(editor, getByText('/'))!,
        offset: '/'.length,
      });
      insertText(editor, 'h');
      await timeout(500);
    });

    await act(() => userEvent.keyboard('{Escape}'));
    expect(queryByText(/sub-head/i)).not.toBeInTheDocument();

    insertText(editor, 'e');
    expect(await findByText(/sub-head/i)).toBeVisible();
  });

  it('does not hide the menu while holding shift', async () => {
    const { getByText } = render(<Plate {...plateProps} editor={editor} />, {
      wrapper,
    });

    await act(async () => {
      focusEditor(editor);
      select(editor, {
        path: findDomNodePath(editor, getByText('/'))!,
        offset: '/'.length,
      });
      insertText(editor, 'h');
      await timeout(500);
    });

    await act(() => userEvent.keyboard('{Shift>}{Escape}'));
    expect(getByText(/sub-head/i)).toBeVisible();
  });
});

it('executes a command on click', async () => {
  const { getByText } = render(<Plate {...plateProps} editor={editor} />, {
    wrapper,
  });

  await act(async () => {
    focusEditor(editor);
    select(editor, {
      path: findDomNodePath(editor, getByText('/'))!,
      offset: '/'.length,
    });
    insertText(editor, 'h');
    await timeout(500);
  });

  userEvent.click(getByText(/sub-head/i));
  await waitFor(() => {
    expect(editor.children).toMatchObject([
      { type: ELEMENT_H3, children: [{ text: '' }] },
    ]);
  });
});

it('uses the text after the slash to search for commands', async () => {
  const { getByText, queryByText } = render(
    <Plate {...plateProps} editor={editor} />,
    { wrapper }
  );

  await act(async () => {
    focusEditor(editor);
    select(editor, {
      path: findDomNodePath(editor, getByText('/'))!,
      offset: '/'.length,
    });
    insertText(editor, 'sub');
    await timeout(500);
  });

  expect(getByText(/secondary.+heading/i)).toBeVisible();
  expect(queryByText(/calculation/i)).not.toBeInTheDocument();
});
