import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { EmptyWorkspaceCta } from './EmptyWorkspaceCta';

it('renders a heading at given level', () => {
  const { getByRole } = render(<EmptyWorkspaceCta />);
  expect(getByRole('heading').tagName).toBe('H1');
});

it('renders a button to create a new notebook', async () => {
  const handleCreateNotebook = jest.fn();
  const { getByText } = render(
    <EmptyWorkspaceCta onCreateNotebook={handleCreateNotebook} />
  );

  await userEvent.click(getByText(/create/i));
  expect(handleCreateNotebook).toHaveBeenCalled();
});
