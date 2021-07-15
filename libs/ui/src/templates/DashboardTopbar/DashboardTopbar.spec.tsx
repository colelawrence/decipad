import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DashboardTopbar } from './DashboardTopbar';

it('renders a level 1 notebook list header', () => {
  const { getByText } = render(<DashboardTopbar userName="John Doe" />);
  expect(getByText(/notebooks/i).tagName).toBe('H1');
});

it('renders a button to create a new notebook', () => {
  const handleCreateNotebook = jest.fn();
  const { getByText } = render(
    <DashboardTopbar
      userName="John Doe"
      onCreateNotebook={handleCreateNotebook}
    />
  );

  userEvent.click(getByText(/create/i));
  expect(handleCreateNotebook).toHaveBeenCalled();
});

it('renders an account menu avatar', () => {
  const { getByLabelText } = render(<DashboardTopbar userName="John Doe" />);
  expect(getByLabelText(/avatar/i)).toBeVisible();
});
