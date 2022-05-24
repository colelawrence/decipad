import { render, screen } from '@testing-library/react';
import { Divider } from './Divider';

it('renders a delete icon', () => {
  render(<Divider />);
  expect(screen.getByTitle(/divider/i)).toBeInTheDocument();
});
