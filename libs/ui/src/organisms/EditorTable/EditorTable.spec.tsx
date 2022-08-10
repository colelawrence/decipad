import { render } from '@testing-library/react';
import { ComponentProps } from 'react';
import { getNumberType, getStringType } from '../../utils';
import { EditorTable } from './EditorTable';

const defaultProps: ComponentProps<typeof EditorTable> = {
  columns: [
    {
      name: 'FirstName',
      cellType: getStringType(),
    },
    {
      name: 'Numbers',
      cellType: getNumberType(),
    },
  ],
  icon: 'Table',
  color: 'Catskill',
};

it('renders the children', () => {
  const { getByText } = render(
    <EditorTable {...defaultProps}>
      <span>Caption</span>
      <tr>
        <th>children th</th>
      </tr>
      <tr>
        <td>children td</td>
      </tr>
    </EditorTable>
  );
  expect(getByText('children th')).toBeVisible();
  expect(getByText('children td')).toBeVisible();
});

it('renders the add row button', () => {
  const { getByText } = render(
    <EditorTable {...defaultProps}>
      <span>Caption</span>
      <tr>
        <th>children th</th>
      </tr>
      <tr>
        <td>children td</td>
      </tr>
    </EditorTable>
  );
  expect(getByText(/add.+row/i)).toBeVisible();
});

it('renders the add new column button', () => {
  const { getByTitle } = render(
    <EditorTable {...defaultProps}>
      <span>Caption</span>
      <tr>
        <th>children th</th>
      </tr>
      <tr>
        <td>children td</td>
      </tr>
    </EditorTable>
  );

  expect(getByTitle('Add Column')).toBeVisible();
});
