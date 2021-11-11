import { ComponentProps } from 'react';
import { render, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditableTableHeader } from './EditableTableHeader';

const defaultProps: ComponentProps<typeof EditableTableHeader> = {
  type: 'string',
  value: 'Table Data',
};

it('renders the value', () => {
  const { getByRole } = render(
    <table>
      <tbody>
        <tr>
          <EditableTableHeader {...defaultProps} />
        </tr>
      </tbody>
    </table>
  );

  expect(getByRole('textbox')).toBeVisible();
});

it('renders the updated value', () => {
  const { getByRole } = render(
    <table>
      <tbody>
        <tr>
          <EditableTableHeader {...defaultProps} />
        </tr>
      </tbody>
    </table>
  );

  expect(getByRole('textbox')).toHaveValue('Table Data');

  userEvent.type(getByRole('textbox'), ' Edited');
  fireEvent.keyDown(getByRole('textbox'), { key: 'Enter' });

  expect(getByRole('textbox')).toHaveValue('Table Data Edited');
});

it('renders the trigger for the dropdown menu', () => {
  const { getByTitle } = render(
    <table>
      <thead>
        <tr>
          <EditableTableHeader {...defaultProps} />
        </tr>
      </thead>
    </table>
  );

  expect(getByTitle(/caret down/i)).toBeInTheDocument();
});
