import { render } from '@testing-library/react';
import { Chart } from './Chart';

it('renders a chart icon', () => {
  const { getByTitle } = render(<Chart />);
  expect(getByTitle(/chart/i)).toBeInTheDocument();
});
