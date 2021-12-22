import { render } from '@testing-library/react';
import { Docs } from './Docs';

it('renders a docs icon', () => {
  const { getByTitle } = render(<Docs />);
  expect(getByTitle(/docs/i)).toBeInTheDocument();
});
