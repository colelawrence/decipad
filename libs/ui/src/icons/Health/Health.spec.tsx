import { render } from '@testing-library/react';
import { Health } from './Health';

it('renders a health icon', () => {
  const { getByTitle } = render(<Health />);
  expect(getByTitle(/health/i)).toBeInTheDocument();
});
