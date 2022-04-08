import { render } from '@testing-library/react';
import { Bolt } from './Bolt';

it('renders a bolt icon', () => {
  const { getByTitle } = render(<Bolt />);
  expect(getByTitle(/bolt/i)).toBeInTheDocument();
});
