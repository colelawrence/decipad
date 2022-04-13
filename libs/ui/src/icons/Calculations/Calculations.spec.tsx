import { render } from '@testing-library/react';
import { Calculations } from './Calculations';

it('renders a calculations icon', () => {
  const { getByTitle } = render(<Calculations />);
  expect(getByTitle(/slashcommandcal/i)).toBeInTheDocument();
});
