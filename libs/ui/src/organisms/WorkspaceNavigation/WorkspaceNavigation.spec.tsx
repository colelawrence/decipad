import { noop } from '@decipad/utils';
import { act, render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { SessionProvider } from 'next-auth/react';
import { WorkspaceNavigation } from './WorkspaceNavigation';

it('renders navigation links', async () => {
  const { getByText } = await act(() =>
    render(
      <SessionProvider
        session={{
          user: {},
          expires: new Date(Date.now() + 100000000).toISOString(),
        }}
      >
        <DndProvider backend={HTML5Backend}>
          <BrowserRouter>
            <WorkspaceNavigation
              activeWorkspace={{
                id: '42',
                sections: [],
              }}
              onDeleteSection={noop}
              onCreateSection={() => new Promise(noop)}
              onUpdateSection={() => new Promise(noop)}
            />
          </BrowserRouter>
        </DndProvider>
      </SessionProvider>
    )
  );
  expect(getByText(/notebook/i).closest('a')).toHaveAttribute(
    'href',
    expect.stringContaining('42')
  );
});
