import { render } from '@testing-library/react';
import { ComponentProps } from 'react';
import { Dashboard } from './Dashboard';

const props: ComponentProps<typeof Dashboard> = {
  topbar: 'topbar',
  sidebar: 'sidebar',
  notebookList: 'notebook list',
};

/* eslint-disable no-bitwise */
it('renders the top bar (which may have popups) stacked above the notebook list', () => {
  const { getByText } = render(
    <Dashboard {...props} topbar="topbar" notebookList="notebook list" />
  );
  expect(
    getByText('notebook list').compareDocumentPosition(getByText('topbar')) &
      Node.DOCUMENT_POSITION_FOLLOWING
  ).toBeTruthy();
});

it('renders the side bar (which may have popups) stacked above the notebook list', () => {
  const { getByText } = render(
    <Dashboard {...props} sidebar="sidebar" notebookList="notebook list" />
  );
  expect(
    getByText('notebook list').compareDocumentPosition(getByText('sidebar')) &
      Node.DOCUMENT_POSITION_FOLLOWING
  ).toBeTruthy();
});
/* eslint-enable no-bitwise */

it('renders a help button', () => {
  const { getByLabelText } = render(<Dashboard {...props} />);
  expect(getByLabelText(/help/i)).toBeVisible();
});
