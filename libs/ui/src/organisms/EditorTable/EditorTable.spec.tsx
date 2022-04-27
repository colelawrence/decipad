import { ComponentProps } from 'react';
import { render } from '@testing-library/react';
import { EditorTable } from './EditorTable';
import { getNumberType, getStringType } from '../../utils';

const defaultProps: ComponentProps<typeof EditorTable> = {
  columns: [
    {
      name: 'FirstName',
      width: 10,
      cellType: getStringType(),
    },
    {
      name: 'Numbers',
      width: 10,
      cellType: getNumberType(),
    },
  ],
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
