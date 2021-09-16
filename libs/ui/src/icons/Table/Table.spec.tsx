import { render } from '@testing-library/react';
import { Table } from './Table';

it('renders a table icon', () => {
  const { getByTitle } = render(<Table />);
  expect(getByTitle(/table/i)).toBeInTheDocument();
});
