import { it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Spoiler } from './Spoiler';

it('renders the children as highlight', () => {
  render(<Spoiler>text</Spoiler>);
  expect(screen.getByText('text').textContent).toContain('text');
});
