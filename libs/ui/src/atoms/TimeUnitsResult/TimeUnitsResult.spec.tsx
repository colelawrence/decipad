import { render } from '@testing-library/react';
import { runCode } from '../../test-utils';

import { TimeUnitsResult } from './TimeUnitsResult';

it('renders time difference', async () => {
  const { getByText } = render(
    <TimeUnitsResult
      {...await runCode('date(2020-01-11) - date(2020-01-01)')}
    />
  );

  expect(getByText('10 days')).toBeVisible();
});
