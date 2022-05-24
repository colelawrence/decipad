import { render, screen } from '@testing-library/react';
import { Create } from './Create';

it('renders a create icon', () => {
  render(<Create />);
  expect(screen.getByTitle(/create/i)).toBeInTheDocument();
});
