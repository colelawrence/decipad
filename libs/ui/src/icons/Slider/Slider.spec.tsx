import { render } from '@testing-library/react';
import { Slider } from './Slider';

it('renders a slider icon', () => {
  const { getByTitle } = render(<Slider />);
  expect(getByTitle(/slider/i)).toBeInTheDocument();
});
