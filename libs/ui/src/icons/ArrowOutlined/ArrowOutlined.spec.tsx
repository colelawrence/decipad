import { render, screen } from '@testing-library/react';
import { ArrowOutlined } from './ArrowOutlined';

it('renders an "announcement" icon', () => {
  render(<ArrowOutlined />);
  expect(screen.getByTitle(/arrowoutlined/i)).toBeInTheDocument();
});
