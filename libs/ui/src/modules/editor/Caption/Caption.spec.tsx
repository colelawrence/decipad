import { render, screen } from '@testing-library/react';
import { Caption } from './Caption';

describe('Caption Molecule', () => {
  it('renders the children', () => {
    render(<Caption>children</Caption>);
    expect(screen.getByText('children')).toBeInTheDocument();
  });

  it('renders a default icon', () => {
    render(<Caption>children</Caption>);
    expect(screen.getByTitle(/frame/i)).toBeInTheDocument();
  });
});
