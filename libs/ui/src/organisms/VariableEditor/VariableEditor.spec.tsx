import { render } from '@testing-library/react';
import { VariableEditor } from '..';

it('renders children', () => {
  const { getByText } = render(<VariableEditor>children</VariableEditor>);
  expect(getByText('children')).toBeVisible();
});
