import { render } from '@testing-library/react';
import { Education } from './Education';

it('renders a education icon', () => {
  const { getByTitle } = render(<Education />);
  expect(getByTitle(/education/i)).toBeInTheDocument();
});
