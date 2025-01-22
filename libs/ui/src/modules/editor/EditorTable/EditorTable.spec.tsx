import { it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ComponentProps } from 'react';
import { EditorTable } from './EditorTable';
import { Plate } from '@udecode/plate-common';
import { noop } from '@decipad/utils';

const defaultProps: ComponentProps<typeof EditorTable> = {
  icon: 'TableSmall',
  color: 'Catskill',
  onAddRow: noop,
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
