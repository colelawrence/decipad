import { render } from '@testing-library/react';
import { VerifyEmail } from './VerifyEmail';

describe('Email confirmation page', () => {
  it('renders the correct title', () => {
    const { getByText } = render(<VerifyEmail />);

    expect(getByText(/check.+email/i)).toBeInTheDocument();
  });

  it('renders a back to login page button', () => {
    const { getByRole } = render(<VerifyEmail />);

    expect(getByRole('link')).toHaveAttribute('href', '/');
  });
});
