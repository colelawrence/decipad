import { render } from '@testing-library/react';
import { Rocket } from './Rocket';

it('renders a rocket icon', () => {
  const { getByTitle } = render(<Rocket />);
  expect(getByTitle(/rocket/i)).toBeInTheDocument();
});
