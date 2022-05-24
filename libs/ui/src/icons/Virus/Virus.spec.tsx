import { render, screen } from '@testing-library/react';
import { Virus } from './Virus';

it('renders a virus icon', () => {
  render(<Virus />);
  expect(screen.getByTitle(/virus/i)).toBeInTheDocument();
});
