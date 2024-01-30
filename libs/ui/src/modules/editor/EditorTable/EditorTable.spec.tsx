import { render } from '@testing-library/react';
import { ComponentProps } from 'react';
import { EditorTable } from './EditorTable';
import { Plate } from '@udecode/plate-common';

const defaultProps: ComponentProps<typeof EditorTable> = {
  icon: 'TableSmall',
  color: 'Catskill',
};

it('renders the children', () => {
  const { getByText } = render(
    <Plate>
      <EditorTable {...defaultProps}>
        <span>Caption</span>
        <tr>
          <th>children th</th>
        </tr>
        <tr>
          <td>children td</td>
        </tr>
      </EditorTable>
    </Plate>
  );
  expect(getByText('children th')).toBeVisible();
  expect(getByText('children td')).toBeVisible();
});

it('renders the add row button', () => {
  const { getByText } = render(
    <Plate>
      <EditorTable {...defaultProps}>
        <span>Caption</span>
        <tr>
          <th>children th</th>
        </tr>
        <tr>
          <td>children td</td>
        </tr>
      </EditorTable>
    </Plate>
  );
  expect(getByText(/add.+row/i)).not.toBeVisible();
});

it('renders the add new column button', () => {
  const { getByTitle } = render(
    <Plate>
      <EditorTable {...defaultProps}>
        <span>Caption</span>
        <tr>
          <th>children th</th>
        </tr>
        <tr>
          <td>children td</td>
        </tr>
      </EditorTable>
    </Plate>
  );

  expect(getByTitle('Add Column')).not.toBeVisible();
});
