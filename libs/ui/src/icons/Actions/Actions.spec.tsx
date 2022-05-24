import { render, screen } from '@testing-library/react';
import { Actions } from './Actions';

it('renders a actions icon', () => {
  render(<Actions />);
  expect(screen.getByTitle(/actions/i)).toBeInTheDocument();
});
