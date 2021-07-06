import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GithubSignInButton } from './GithubSignInButton.component';

it('renders a button to sign in with GitHub', () => {
  const { getByText } = render(<GithubSignInButton />);
  expect(getByText(/GitHub/)).toBeVisible();
});
it('emits onClick events', () => {
  const handleClick = jest.fn();
  const { getByRole } = render(<GithubSignInButton onClick={handleClick} />);

  userEvent.click(getByRole('button'));
  expect(handleClick).toHaveBeenCalled();
});
