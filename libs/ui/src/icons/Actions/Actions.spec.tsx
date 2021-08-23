import { render } from '@testing-library/react';
import { Actions } from './Actions';

it('renders a actions icon', () => {
  const { getByTitle } = render(<Actions />);
  expect(getByTitle(/actions/i)).toBeInTheDocument();
});
