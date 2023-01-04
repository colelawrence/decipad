import { noop } from '@decipad/utils';
import { render } from '@testing-library/react';
import { WorkspaceNavigation } from './WorkspaceNavigation';

it('renders navigation links', () => {
  const { getAllByRole, getByText } = render(
    <WorkspaceNavigation
      activeWorkspace={{ id: '42', sections: [] }}
      onDeleteSection={noop}
      onCreateSection={() => new Promise(noop)}
      onUpdateSection={() => new Promise(noop)}
    />
  );
  expect(getAllByRole('listitem')).toHaveLength(4);
  expect(getByText(/notebook/i).closest('a')).toHaveAttribute(
    'href',
    expect.stringContaining('42')
  );
  expect(getByText(/preference/i).closest('a')).toHaveAttribute(
    'href',
    expect.stringContaining('42')
  );
});
