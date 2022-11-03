import { render, screen } from '@testing-library/react';
import { Paperclip } from './Paperclip';

it('renders a paperlip icon', () => {
  render(<Paperclip />);
  expect(screen.getByTitle(/paperclip/i)).toBeInTheDocument();
});
