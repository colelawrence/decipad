import { render } from '@testing-library/react';
import { Caption } from './Caption';

describe('Caption Molecule', () => {
  it('renders the children', () => {
    const { getByText } = render(<Caption>children</Caption>);
    expect(getByText('children')).toBeInTheDocument();
  });

  it('renders a default icon', () => {
    const { getByTitle } = render(<Caption>children</Caption>);
    expect(getByTitle(/frame/i)).toBeInTheDocument();
  });
});
