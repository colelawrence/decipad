import { findParentWithStyle } from '@decipad/dom-test-utils';
import { getByTitle, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentProps, FC, PropsWithChildren } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ClientEventsContext } from '@decipad/client-events';
import { SessionProvider } from 'next-auth/react';
import { noopPromise } from '@decipad/editor-utils';
import { QueryParamProvider } from 'use-query-params';
import { BrowserRouter } from 'react-router-dom';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';
import { NotebookList } from './NotebookList';

const props: ComponentProps<typeof NotebookList> = {
  notebooks: [],
  otherWorkspaces: [],
  Heading: 'h1',
};

interface WithProvidersProps {
  noSession?: boolean;
}

const WithProviders: FC<PropsWithChildren<WithProvidersProps>> = ({
  children,
  noSession = false,
}) => (
  <BrowserRouter>
    <QueryParamProvider adapter={ReactRouter6Adapter}>
      <ClientEventsContext.Provider value={noopPromise}>
        <SessionProvider
          session={
            noSession
              ? null
              : {
                  user: {},
                  expires: new Date(Date.now() + 100000000).toISOString(),
                }
          }
        >
          <DndProvider backend={HTML5Backend}>{children}</DndProvider>
        </SessionProvider>
      </ClientEventsContext.Provider>
    </QueryParamProvider>
  </BrowserRouter>
);

it('renders a CTA to create a notebook if there are none', () => {
  const { getByText } = render(
    <WithProviders>
      <NotebookList {...props} notebooks={[]} />
    </WithProviders>
  );
  expect(getByText(/create/i)).toBeVisible();
});

it('does not crash if notebook has no status', () => {
  const { getByText } = render(
    <WithProviders>
      <NotebookList
        {...props}
        notebooks={[
          {
            id: '0',
            name: 'First',
            icon: 'Rocket',
            iconColor: 'Catskill',
          } as any,
          {
            id: '1',
            name: 'Second',
            icon: 'Rocket',
            iconColor: 'Catskill',
            status: undefined,
          } as any,
        ]}
      />
    </WithProviders>
  );
  expect(getByText(/first/i)).toBeVisible();
});
it('renders a list of notebooks', () => {
  const { getAllByRole } = render(
    <WithProviders>
      <NotebookList
        {...props}
        notebooks={[
          {
            id: '0',
            name: 'First',
            icon: 'Rocket',
            iconColor: 'Catskill',
            status: 'draft',
          },
          {
            id: '1',
            name: 'Second',
            icon: 'Rocket',
            iconColor: 'Catskill',
            status: 'draft',
          },
        ]}
      />
    </WithProviders>
  );
  expect(
    getAllByRole('listitem').map(({ textContent }) => textContent)
  ).toEqual([
    expect.stringContaining('First'),
    expect.stringContaining('Second'),
  ]);
});

it('renders an item with actions open on top', async () => {
  const { getByText } = render(
    <WithProviders>
      <NotebookList
        {...props}
        notebooks={[
          {
            id: '0',
            name: 'First',
            icon: 'Rocket',
            iconColor: 'Catskill',
            status: 'draft',
          },
          {
            id: '1',
            name: 'Second',
            icon: 'Rocket',
            iconColor: 'Catskill',
            status: 'draft',
          },
        ]}
      />
    </WithProviders>
  );
  await userEvent.click(
    getByTitle(getByText('First').closest('li')!, /ellipsis/i)
  );

  expect(
    Number(findParentWithStyle(getByText('First'), 'zIndex')!.zIndex)
  ).toBeGreaterThan(
    Number(findParentWithStyle(getByText('Second'), 'zIndex')!.zIndex)
  );
});

// eslint-disable-next-line jest/no-disabled-tests
it.skip('only allows one open actions menu at a time', async () => {
  const container = document.createElement('div');
  container.style.pointerEvents = 'all';
  const { getByText } = render(
    <WithProviders>
      <NotebookList
        {...props}
        notebooks={[
          {
            id: '0',
            name: 'First',
            icon: 'Rocket',
            iconColor: 'Catskill',
            status: 'draft',
          },
          {
            id: '1',
            name: 'Second',
            icon: 'Rocket',
            iconColor: 'Catskill',
            status: 'draft',
          },
        ]}
      />
    </WithProviders>,
    { container }
  );
  await userEvent.click(
    getByTitle(getByText('Second').closest('li')!, /ellipsis/i)
  );
  await userEvent.click(
    getByTitle(getByText('First').closest('li')!, /ellipsis/i)
  );

  expect(getByText('First').closest('li')).toContainElement(getByText(/dup/i));
});

// eslint-disable-next-line jest/no-disabled-tests
it.skip('emits duplicate events', async () => {
  const handleDuplicate = jest.fn();
  const container = document.createElement('div');
  container.style.pointerEvents = 'all';
  const { getByText } = render(
    <WithProviders>
      <NotebookList
        {...props}
        notebooks={[
          {
            id: '0',
            name: 'First',
            icon: 'Rocket',
            iconColor: 'Catskill',
            status: 'review',
          },
          {
            id: '1',
            name: 'Second',
            icon: 'Rocket',
            iconColor: 'Catskill',
            status: 'done',
          },
        ]}
        onDuplicate={handleDuplicate}
      />
    </WithProviders>,
    { container }
  );

  await userEvent.click(
    getByTitle(getByText('Second').closest('li')!, /ellipsis/i)
  );
  await userEvent.click(getByText(/dup/i, { selector: 'div' }));
  expect(handleDuplicate).toHaveBeenCalledWith('1');
});

// eslint-disable-next-line jest/no-disabled-tests
it.skip('emits delete events', async () => {
  const handleDelete = jest.fn();
  const container = document.createElement('div');
  container.style.pointerEvents = 'all';
  const { getByText } = render(
    <WithProviders>
      <NotebookList
        {...props}
        notebooks={[
          {
            id: '0',
            name: 'First',
            icon: 'Rocket',
            iconColor: 'Catskill',
            status: 'draft',
          },
        ]}
        onDelete={handleDelete}
      />
    </WithProviders>,
    { container }
  );

  await userEvent.click(
    getByTitle(getByText('First').closest('li')!, /ellipsis/i)
  );
  await userEvent.click(getByText(/archive/i));
  expect(handleDelete).toHaveBeenCalledWith('0');
});
