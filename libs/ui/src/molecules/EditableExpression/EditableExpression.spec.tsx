import { render } from '@testing-library/react';

import { EditableExpression } from './EditableExpression';

it('renders children', () => {
  const { getByText } = render(
    <EditableExpression focused content="">
      children
    </EditableExpression>
  );
  expect(getByText('children')).toBeVisible();
});

it('renders placeholder when empty and focused', () => {
  const { getByText } = render(
    <EditableExpression focused content="">
      children
    </EditableExpression>
  );
  expect(getByText('children')).toHaveAttribute('aria-placeholder', '1 km');
});
