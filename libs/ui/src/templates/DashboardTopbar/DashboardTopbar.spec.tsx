import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentProps } from 'react';

import { DashboardTopbar } from './DashboardTopbar';

const props: ComponentProps<typeof DashboardTopbar> = {
  name: 'John Doe',
  email: 'john.doe@example.com',
};

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

it('renders an account menu avatar', () => {
  const { getByLabelText } = render(<DashboardTopbar {...props} />);
  expect(getByLabelText(/avatar/i)).toBeVisible();
});
describe('when clicking the account menu avatar', () => {
  it('opens and closes the account menu', async () => {
    const { getByLabelText, getByText, queryByText } = render(
      <DashboardTopbar {...props} />
    );
    expect(queryByText(/log.*out/i)).not.toBeInTheDocument();

    await userEvent.click(getByLabelText(/avatar/i));
    expect(getByText(/log.*out/i, { selector: 'nav li button' })).toBeVisible();

    await userEvent.click(getByLabelText(/avatar/i));
    expect(queryByText(/log.*out/i)).not.toBeInTheDocument();
  });
});
