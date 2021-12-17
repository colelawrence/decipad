import { render } from '@testing-library/react';
import { runCode } from '../../test-utils';
import { RangeResult } from './RangeResult';

it('renders range', async () => {
  const { getByText } = render(
    <RangeResult {...await runCode('[1 through 10]')} />
  );

  expect(getByText('1')).toBeVisible();
  expect(getByText('10')).toBeVisible();
});

it('renders date range', async () => {
  const { getByText } = render(
    <RangeResult {...await runCode('[date(2021) through date(2031)]')} />
  );

  expect(getByText('2021')).toBeVisible();
  expect(getByText('2031')).toBeVisible();
});
