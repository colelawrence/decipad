import { render } from '@testing-library/react';
import { MagicNumber } from './MagicNumber';

it('renders the loading without a variable', () => {
  const { getByText } = render(<MagicNumber></MagicNumber>);
  expect(getByText('Loading')).toBeDefined();
});
