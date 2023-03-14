import { render, screen } from '@testing-library/react';
import { PlotParams } from './PlotParams';
import { params } from './PlotParams.stories';

it('renders a the plot params', () => {
  render(<PlotParams {...params} />);
  expect(screen.getAllByText(/settings/i)).toHaveLength(2);
});
