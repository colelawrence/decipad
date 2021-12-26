import { render, screen } from '@testing-library/react';
import { AuthContent } from './AuthContent';

describe('Auth Content Molecule', () => {
  it('renders the title and description', () => {
    const { getByText } = render(
      <AuthContent title="my title" description="this is a description" />
    );

    expect(getByText(/my title/i)).toBeInTheDocument();
    expect(screen.getByText(/this is a description/i)).toBeInTheDocument();
  });

  it('renders the deci brand svg', () => {
    const { getByTitle } = render(
      <AuthContent title="my title" description="this is a description" />
    );

    expect(getByTitle(/deci logo/i)).toBeInTheDocument();
  });
});
