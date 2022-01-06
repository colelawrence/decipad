import { render } from '@testing-library/react';
import { AuthContent } from './AuthContent';

describe('Auth Content Molecule', () => {
  it('renders the title and description', () => {
    const { getByText } = render(
      <AuthContent title="My Title" description="This is a description" />
    );

    expect(getByText('My Title')).toBeInTheDocument();
    expect(getByText('This is a description')).toBeInTheDocument();
  });

  it('renders the deci brand svg', () => {
    const { getByTitle } = render(
      <AuthContent title="My Title" description="This is a description" />
    );

    expect(getByTitle(/deci logo/i)).toBeInTheDocument();
  });
});
