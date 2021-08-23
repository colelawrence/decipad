import { render } from '@testing-library/react';
import { File } from './File';

it('renders a file icon', () => {
  const { getByTitle } = render(<File />);
  expect(getByTitle(/file/i)).toBeInTheDocument();
});
