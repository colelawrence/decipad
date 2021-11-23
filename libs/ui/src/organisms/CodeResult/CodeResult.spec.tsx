import { render } from '@testing-library/react';
import { Type } from '@decipad/language';

import { CodeResult } from './CodeResult';

it('renders value of the given type', () => {
  const { getByText } = render(
    <CodeResult value={10} variant="inline" type={{ type: 'number' } as Type} />
  );

  expect(getByText('10')).toBeVisible();
});
