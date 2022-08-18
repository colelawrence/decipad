import { render, screen } from '@testing-library/react';
import { EditableTableCaption } from './EditableTableCaption';

it('renders the text', () => {
  render(
    <EditableTableCaption onAddDataViewButtonPress={() => null}>
      TableName
    </EditableTableCaption>
  );

  expect(screen.getByText('TableName')).toBeVisible();
});
