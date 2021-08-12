import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { EmptyWorkspaceCta } from './EmptyWorkspaceCta';

it('renders a heading at given level', () => {
  const { getByRole } = render(<EmptyWorkspaceCta Heading="h1" />);
  expect(getByRole('heading').tagName).toBe('H1');
});

it('renders a button to create a new notebook', () => {
  const handleCreateNotebook = jest.fn();
  const { getByText } = render(
    <EmptyWorkspaceCta Heading="h1" onCreateNotebook={handleCreateNotebook} />
  );

  userEvent.click(getByText(/create/i));
  expect(handleCreateNotebook).toHaveBeenCalled();
});
