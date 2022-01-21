import { ComponentProps } from 'react';
import { render, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditableTableHeader } from './EditableTableHeader';

const defaultProps: ComponentProps<typeof EditableTableHeader> = {
  type: 'string',
  value: 'TableHeader',
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

  expect(getByRole('textbox')).toHaveValue('TableHeader');

  userEvent.type(getByRole('textbox'), 'Edited');
  fireEvent.keyDown(getByRole('textbox'), { key: 'Enter' });

  expect(getByRole('textbox')).toHaveValue('TableHeaderEdited');
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

  expect(getByTitle(/text/i)).toBeInTheDocument();
});

describe('onChange prop', () => {
  it('gets called only when new text is submitted', () => {
    const onChange = jest.fn();
    const { getByRole } = render(
      <table>
        <tbody>
          <tr>
            <EditableTableHeader {...defaultProps} onChange={onChange} />
          </tr>
        </tbody>
      </table>
    );

    userEvent.type(getByRole('textbox'), 'Edited');

    expect(onChange).not.toHaveBeenCalled();

    fireEvent.keyDown(getByRole('textbox'), { key: 'Enter' });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('TableHeaderEdited');
  });

  it('ignores characters that fail the identifier pattern', () => {
    const onChange = jest.fn();
    const { getByRole } = render(
      <table>
        <tbody>
          <tr>
            <EditableTableHeader
              {...defaultProps}
              onChange={onChange}
              value=""
            />
          </tr>
        </tbody>
      </table>
    );

    // See https://www.ptiglobal.com/2018/04/26/the-beauty-of-unicode-zero-width-characters/ and
    // the `libs/ui/src/utils/language.ts` file.
    userEvent.type(
      getByRole('textbox'),
      '##123\u200B\u200C\u200D\u2060\uFEFF!#,...-$Edite   d123'
    );

    expect(onChange).not.toHaveBeenCalled();

    fireEvent.keyDown(getByRole('textbox'), { key: 'Enter' });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('$Edited123');
  });
});

describe('readOnly prop', () => {
  it('does not render the column menu', () => {
    const { queryAllByRole, rerender } = render(
      <table>
        <thead>
          <tr>
            <EditableTableHeader {...defaultProps} readOnly={false} />
          </tr>
        </thead>
      </table>
    );
    const getPopupButton = () =>
      queryAllByRole(
        (content, element) =>
          content === 'button' && element?.getAttribute('aria-haspopup')
      );

    expect(getPopupButton()).toHaveLength(1);
    expect(getPopupButton()[0]).toBeVisible();

    rerender(
      <table>
        <thead>
          <tr>
            <EditableTableHeader {...defaultProps} readOnly />
          </tr>
        </thead>
      </table>
    );
    expect(getPopupButton()).toHaveLength(0);
  });
});
