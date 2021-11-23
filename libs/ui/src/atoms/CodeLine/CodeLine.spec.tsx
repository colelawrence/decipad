import { render } from '@testing-library/react';

import { CodeLine } from './CodeLine';

it('renders children', () => {
  const { getByText } = render(<CodeLine>10</CodeLine>);
  expect(getByText('10')).toBeVisible();
});
