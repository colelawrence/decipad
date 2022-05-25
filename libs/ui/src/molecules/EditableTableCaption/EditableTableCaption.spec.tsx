import { render, screen } from '@testing-library/react';
import { EditableTableCaption } from './EditableTableCaption';

it('renders the text', () => {
  render(<EditableTableCaption>TableName</EditableTableCaption>);

  expect(screen.getByText('TableName')).toBeVisible();
});
