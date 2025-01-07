import { it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { runCode } from '../../../test-utils';
import { BooleanResult } from './BooleanResult';

it('renders true', async () => {
  const { container } = render(<BooleanResult {...await runCode('true')} />);

  expect(
    container.querySelector('[data-title="CheckboxSelected"]')
  ).toBeDefined();
});

it('renders false', async () => {
  render(<BooleanResult {...await runCode('false')} />);

  expect(screen.getByTitle(/CheckboxUnselected/)).toBeDefined();
});
