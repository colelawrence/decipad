import { render, screen } from '@testing-library/react';
import { Close } from './Close';

it('renders a close icon', () => {
  render(<Close />);
  expect(screen.getByTitle(/close/i)).toBeInTheDocument();
});
