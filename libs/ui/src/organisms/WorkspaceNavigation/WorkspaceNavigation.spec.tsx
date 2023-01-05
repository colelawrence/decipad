import { noop } from '@decipad/utils';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { WorkspaceNavigation } from './WorkspaceNavigation';

it('renders navigation links', () => {
  const { getByText } = render(
    <DndProvider backend={HTML5Backend}>
      <BrowserRouter>
        <WorkspaceNavigation
          activeWorkspace={{ id: '42', sections: [] }}
          onDeleteSection={noop}
          onCreateSection={() => new Promise(noop)}
          onUpdateSection={() => new Promise(noop)}
        />
      </BrowserRouter>
    </DndProvider>
  );
  expect(getByText(/notebook/i).closest('a')).toHaveAttribute(
    'href',
    expect.stringContaining('42')
  );
});
