import { render } from '@testing-library/react';
import { Close } from './Close';

it('renders a close icon', () => {
  const { getByTitle } = render(<Close />);
  expect(getByTitle(/close/i)).toBeInTheDocument();
});
