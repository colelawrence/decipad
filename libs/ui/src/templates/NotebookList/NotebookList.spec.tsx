import { findParentWithStyle } from '@decipad/dom-test-utils';
import { getByTitle, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentProps } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { NotebookList } from './NotebookList';

const props: ComponentProps<typeof NotebookList> = {
  Heading: 'h1',
  notebooks: [],
};

it('renders a CTA to create a notebook if there are none', () => {
  const { getByText } = render(
    <DndProvider backend={HTML5Backend}>
      <NotebookList {...props} notebooks={[]} />
    </DndProvider>
  );
  expect(getByText(/create/i)).toBeVisible();
});
it('renders a list of notebooks', () => {
  const { getAllByRole } = render(
    <DndProvider backend={HTML5Backend}>
      <NotebookList
        {...props}
        notebooks={[
          {
            id: '0',
            name: 'First',
            href: '',
            exportFileName: '',
            exportHref: '',
          },
          {
            id: '1',
            name: 'Second',
            href: '',
            exportFileName: '',
            exportHref: '',
          },
        ]}
      />
    </DndProvider>
  );
  expect(
    getAllByRole('listitem').map(({ textContent }) => textContent)
  ).toEqual([
    expect.stringContaining('First'),
    expect.stringContaining('Second'),
  ]);
});

it('renders an item with actions open on top', () => {
  const { getByText } = render(
    <DndProvider backend={HTML5Backend}>
      <NotebookList
        {...props}
        notebooks={[
          {
            id: '0',
            name: 'First',
            href: '',
            exportFileName: '',
            exportHref: '',
          },
          {
            id: '1',
            name: 'Second',
            href: '',
            exportFileName: '',
            exportHref: '',
          },
        ]}
      />
    </DndProvider>
  );
  userEvent.click(getByTitle(getByText('First').closest('li')!, /ellipsis/i));

  expect(
    Number(findParentWithStyle(getByText('First'), 'zIndex')!.zIndex)
  ).toBeGreaterThan(
    Number(findParentWithStyle(getByText('Second'), 'zIndex')!.zIndex)
  );
});

it('only allows one open actions menu at a time', () => {
  const { getByText } = render(
    <DndProvider backend={HTML5Backend}>
      <NotebookList
        {...props}
        notebooks={[
          {
            id: '0',
            name: 'First',
            href: '',
            exportFileName: '',
            exportHref: '',
          },
          {
            id: '1',
            name: 'Second',
            href: '',
            exportFileName: '',
            exportHref: '',
          },
        ]}
      />
    </DndProvider>
  );
  userEvent.click(getByTitle(getByText('Second').closest('li')!, /ellipsis/i));
  userEvent.click(getByTitle(getByText('First').closest('li')!, /ellipsis/i));

  expect(getByText('First').closest('li')).toContainElement(getByText(/dup/i));
});

it('emits duplicate events', () => {
  const handleDuplicate = jest.fn();
  const { getByText } = render(
    <DndProvider backend={HTML5Backend}>
      <NotebookList
        {...props}
        notebooks={[
          {
            id: '0',
            name: 'First',
            href: '',
            exportFileName: '',
            exportHref: '',
          },
          {
            id: '1',
            name: 'Second',
            href: '',
            exportFileName: '',
            exportHref: '',
          },
        ]}
        onDuplicate={handleDuplicate}
      />
    </DndProvider>
  );

  userEvent.click(getByTitle(getByText('Second').closest('li')!, /ellipsis/i));
  userEvent.click(getByText(/dup/i, { selector: 'button' }));
  expect(handleDuplicate).toHaveBeenCalledWith('1');
});
it('emits delete events', () => {
  const handleDelete = jest.fn();
  const { getByText } = render(
    <DndProvider backend={HTML5Backend}>
      <NotebookList
        {...props}
        notebooks={[
          {
            id: '0',
            name: 'First',
            href: '',
            exportFileName: '',
            exportHref: '',
          },
          {
            id: '1',
            name: 'Second',
            href: '',
            exportFileName: '',
            exportHref: '',
          },
        ]}
        onDelete={handleDelete}
      />
    </DndProvider>
  );

  userEvent.click(getByTitle(getByText('Second').closest('li')!, /ellipsis/i));
  userEvent.click(getByText(/delete|remove/i, { selector: 'button' }));
  expect(handleDelete).toHaveBeenCalledWith('1');
});
