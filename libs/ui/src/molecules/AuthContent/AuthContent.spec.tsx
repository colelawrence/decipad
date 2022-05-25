import { render, screen } from '@testing-library/react';
import { AuthContent } from './AuthContent';

describe('Auth Content Molecule', () => {
  it('renders the title and description', () => {
    render(
      <AuthContent title="My Title" description="This is a description" />
    );

    expect(screen.getByText('My Title')).toBeInTheDocument();
    expect(screen.getByText('This is a description')).toBeInTheDocument();
  });

  it('renders the deci brand svg', () => {
    render(
      <AuthContent title="My Title" description="This is a description" />
    );

    expect(screen.getByTitle(/decipad logo/i)).toBeInTheDocument();
  });
});
