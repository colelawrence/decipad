import { render } from '@testing-library/react';
import { Virus } from './Virus';

it('renders a virus icon', () => {
  const { getByTitle } = render(<Virus />);
  expect(getByTitle(/virus/i)).toBeInTheDocument();
});
