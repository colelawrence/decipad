import { render } from '@testing-library/react';
import { VerifyEmail } from './VerifyEmail';

describe('Email confirmation page', () => {
  it('renders the correct title', () => {
    const { getByText } = render(<VerifyEmail email="foobar@decipad.com" />);

    expect(getByText(/check.+inbox/i)).toBeInTheDocument();
  });

  it('renders a back to login page button', () => {
    const { getByText } = render(<VerifyEmail email="foobar@decipad.com" />);

    expect(getByText('Go back to website')).toHaveAttribute(
      'href',
      'https://decipad.com/'
    );
  });
});
