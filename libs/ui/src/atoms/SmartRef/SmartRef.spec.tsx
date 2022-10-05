import { render, screen } from '@testing-library/react';
import { SmartRef } from './SmartRef';

it('renders the loading without a variable', () => {
  render(<SmartRef symbolName="my symbol name"></SmartRef>);
  expect(screen.getByText('my symbol name')).toBeDefined();
});
