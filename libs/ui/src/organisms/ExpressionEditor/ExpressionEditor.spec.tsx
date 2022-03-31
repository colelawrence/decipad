import { render } from '@testing-library/react';
import { ExpressionEditor } from '..';

it('renders children', async () => {
  const { getByText } = render(<ExpressionEditor>children</ExpressionEditor>);
  expect(getByText('children')).toBeVisible();
});
