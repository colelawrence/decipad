import { render } from '@testing-library/react';
import { Frame } from './Frame';

it('renders a frame icon', () => {
  const { getByTitle } = render(<Frame />);
  expect(getByTitle(/frame/i)).toBeInTheDocument();
});
