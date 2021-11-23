import { render } from '@testing-library/react';

import { CodeVariable } from './CodeVariable';

it('renders children', () => {
  const { getByText } = render(<CodeVariable>Foo</CodeVariable>);
  expect(getByText('Foo')).toBeVisible();
});
