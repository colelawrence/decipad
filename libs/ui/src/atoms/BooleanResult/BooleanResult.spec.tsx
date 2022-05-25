import { render, screen } from '@testing-library/react';
import { runCode } from '../../test-utils';
import { BooleanResult } from './BooleanResult';

it('renders true', async () => {
  render(<BooleanResult {...await runCode('true')} />);

  expect(screen.getByTitle(/selected/)).toBeDefined();
});

it('renders false', async () => {
  render(<BooleanResult {...await runCode('false')} />);

  expect(screen.getByTitle(/unselected/)).toBeDefined();
});
