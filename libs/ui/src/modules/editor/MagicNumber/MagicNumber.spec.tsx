import { render, screen } from '@testing-library/react';
import { MagicNumber } from './MagicNumber';

it('renders the loading without a variable', () => {
  render(<MagicNumber></MagicNumber>);
  expect(screen.getByText('Loading')).toBeDefined();
});
