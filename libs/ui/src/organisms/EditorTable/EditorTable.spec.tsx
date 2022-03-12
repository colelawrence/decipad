import { ComponentProps } from 'react';
import { render, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditorTable } from './EditorTable';
import { getNumberType, getStringType } from '../../utils';

const defaultProps: ComponentProps<typeof EditorTable> = {
  value: {
    variableName: 'TableName',
    columns: [
      {
        columnName: 'FirstName',
        cells: ['Mary', 'Pena', 'Zé'],
        cellType: getStringType(),
      },
      {
        columnName: 'Numbers',
        cells: ['1', '2', '3'],
        cellType: getNumberType(),
      },
    ],
  },
};

it('renders the table title', () => {
  const { getByDisplayValue } = render(<EditorTable {...defaultProps} />);
  expect(getByDisplayValue('TableName')).toBeVisible();
});

it('renders the column titles', () => {
  const { getByDisplayValue } = render(<EditorTable {...defaultProps} />);
  expect(getByDisplayValue('FirstName')).toBeVisible();
  expect(getByDisplayValue('Numbers')).toBeVisible();
});

it('renders the cells', () => {
  const { getByDisplayValue } = render(<EditorTable {...defaultProps} />);
  expect(getByDisplayValue('Mary')).toBeVisible();
  expect(getByDisplayValue('Pena')).toBeVisible();
  expect(getByDisplayValue('Zé')).toBeVisible();
  expect(getByDisplayValue('1')).toBeVisible();
  expect(getByDisplayValue('2')).toBeVisible();
  expect(getByDisplayValue('3')).toBeVisible();
});

it('renders the add row button', () => {
  const { getByText } = render(<EditorTable {...defaultProps} />);
  expect(getByText(/add.+row/i)).toBeVisible();
});

describe('onChangeColumnName', () => {
  it('gets called with the correct parameters', () => {
    const onChangeColumnName = jest.fn();
    const { getByDisplayValue } = render(
      <EditorTable {...defaultProps} onChangeColumnName={onChangeColumnName} />
    );

    const columnInput = getByDisplayValue('FirstName');
    userEvent.type(columnInput, 'Edited');
    fireEvent.keyDown(columnInput, { key: 'Enter' });

    expect(onChangeColumnName).toHaveBeenCalledWith(0, 'FirstNameEdited');
  });
});

describe('onChangeCell', () => {
  it('gets called with the correct parameters', () => {
    const onChangeCell = jest.fn();
    const { getByDisplayValue } = render(
      <EditorTable {...defaultProps} onChangeCell={onChangeCell} />
    );

    const columnInput = getByDisplayValue('Zé');
    userEvent.type(columnInput, ' Edited');
    fireEvent.keyDown(columnInput, { key: 'Enter' });

    expect(onChangeCell).toHaveBeenCalledWith(0, 2, 'Zé Edited');
  });
});

describe('onValidateCell', () => {
  it('gets called with the correct parameters', () => {
    const onValidateCell = jest.fn();
    const { getByDisplayValue } = render(
      <EditorTable {...defaultProps} onValidateCell={onValidateCell} />
    );

    const columnInput = getByDisplayValue('Zé');
    userEvent.type(columnInput, ' Edited');
    fireEvent.keyDown(columnInput, { key: 'Enter' });

    expect(onValidateCell).toHaveBeenCalledWith(
      expect.objectContaining(defaultProps.value.columns[0]),
      'Zé Edited'
    );
  });
});
