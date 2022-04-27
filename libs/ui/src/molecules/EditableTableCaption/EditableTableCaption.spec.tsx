import { render } from '@testing-library/react';

import { EditableTableCaption } from './EditableTableCaption';

it('renders the text', () => {
  const { getByText } = render(
    <EditableTableCaption>TableName</EditableTableCaption>
  );

  expect(getByText('TableName')).toBeVisible();
});
