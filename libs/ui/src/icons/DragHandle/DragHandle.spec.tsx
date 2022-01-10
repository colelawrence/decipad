import { render } from '@testing-library/react';
import { DragHandle } from './DragHandle';

it('renders a drag handle', () => {
  const { getByTitle } = render(<DragHandle />);
  expect(getByTitle(/drag/i)).toBeInTheDocument();
});
