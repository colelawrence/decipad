import { render } from '@testing-library/react';
import { Checkbox } from './Checkbox';

it('renders checkbox component', () => {
  const { getByTestId } = render(<Checkbox checked={true} />);
  expect(getByTestId('checkbox')).toBeInTheDocument();
});
