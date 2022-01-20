import { render } from '@testing-library/react';
import { Warning } from './Warning';

it('renders a warning icon', () => {
  const { getByTitle } = render(<Warning />);
  expect(getByTitle(/warning/i)).toBeInTheDocument();
});
