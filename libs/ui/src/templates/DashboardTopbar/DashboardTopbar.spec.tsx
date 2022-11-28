import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentProps } from 'react';

import { DashboardTopbar } from './DashboardTopbar';

const props: ComponentProps<typeof DashboardTopbar> = {};

it('renders a level 1 notebook list header', () => {
  const { getByText } = render(<DashboardTopbar {...props} />);
  expect(getByText(/notebooks/i).tagName).toBe('H1');
});

it('renders a button to create a new notebook', async () => {
  const handleCreateNotebook = jest.fn();
  const { getByText } = render(
    <DashboardTopbar {...props} onCreateNotebook={handleCreateNotebook} />
  );

  await userEvent.click(getByText(/create.+notebook/i));
  expect(handleCreateNotebook).toHaveBeenCalled();
});
