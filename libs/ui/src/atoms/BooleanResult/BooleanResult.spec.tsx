import { render } from '@testing-library/react';
import { runCode } from '../../test-utils';
import { BooleanResult } from './BooleanResult';

it('renders true', async () => {
  const { getByTitle } = render(<BooleanResult {...await runCode('true')} />);

  expect(getByTitle(/selected/)).toBeDefined();
});

it('renders false', async () => {
  const { getByTitle } = render(<BooleanResult {...await runCode('false')} />);

  expect(getByTitle(/unselected/)).toBeDefined();
});
