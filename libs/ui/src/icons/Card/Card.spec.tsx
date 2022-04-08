import { render } from '@testing-library/react';
import { Card } from './Card';

it('renders a card icon', () => {
  const { getByTitle } = render(<Card />);
  expect(getByTitle(/card/i)).toBeInTheDocument();
});
