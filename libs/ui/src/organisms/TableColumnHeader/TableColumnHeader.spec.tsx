import { ComponentProps } from 'react';
import { render } from '@testing-library/react';
import { TableColumnHeader } from './TableColumnHeader';

const defaultProps: ComponentProps<typeof TableColumnHeader> = {
  readOnly: false,
  type: { kind: 'string' },
  children: <span>children</span>,
};

it('renders the children', () => {
  const { getByText } = render(
    <table>
      <tbody>
        <tr>
          <TableColumnHeader {...defaultProps} />
        </tr>
      </tbody>
    </table>
  );

  expect(getByText('children')).toBeVisible();
});

it('renders the trigger for the dropdown menu', () => {
  const { getByTitle } = render(
    <table>
      <thead>
        <tr>
          <TableColumnHeader {...defaultProps} />
        </tr>
      </thead>
    </table>
  );

  expect(getByTitle(/text/i)).toBeInTheDocument();
});

describe('readOnly prop', () => {
  it('does not render the column menu', () => {
    const { queryAllByRole, rerender } = render(
      <table>
        <thead>
          <tr>
            <TableColumnHeader {...defaultProps} readOnly={false} />
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
            <TableColumnHeader {...defaultProps} readOnly />
          </tr>
        </thead>
      </table>
    );
    expect(getPopupButton()).toHaveLength(0);
  });
});
