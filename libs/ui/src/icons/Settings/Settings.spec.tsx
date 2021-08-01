import { render } from '@testing-library/react';
import { Settings } from './Settings';

it('renders a settings icon', () => {
  const { getByTitle } = render(<Settings />);
  expect(getByTitle(/settings/i)).toBeInTheDocument();
});
