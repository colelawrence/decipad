import { render, screen } from '@testing-library/react';
import { Education } from './Education';

it('renders a education icon', () => {
  render(<Education />);
  expect(screen.getByTitle(/education/i)).toBeInTheDocument();
});
