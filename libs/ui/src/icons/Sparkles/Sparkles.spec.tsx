import { render } from '@testing-library/react';
import { Sparkles } from './Sparkles';

it('renders a sparkles icon', () => {
  const { getByTitle } = render(<Sparkles />);
  expect(getByTitle(/sparkles/i)).toBeInTheDocument();
});
