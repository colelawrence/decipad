import { render } from '@testing-library/react';
import { SmartCell } from './SmartCell';

it('renders', () => {
  const { getByText } = render(<SmartCell aggregationType="aggtype" />);

  expect(getByText(/aggtype/i)).toBeInTheDocument();
});
