import { render } from '@testing-library/react';
import { runCode } from '../../test-utils';

import { CodeResult } from './CodeResult';

it('renders value of the given type', async () => {
  const { getByText } = render(
    <CodeResult {...await runCode('10')} variant="inline" />
  );

  expect(getByText('10')).toBeVisible();
});
