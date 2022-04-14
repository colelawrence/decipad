import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AddTableRowButton } from './AddTableRowButton';

it('renders the text', () => {
  const { getByText } = render(
    <table>
      <tbody>
        <AddTableRowButton colSpan={1} />
      </tbody>
    </table>
  );

  expect(getByText('Add row')).toBeVisible();
});

describe('onAddRow prop', () => {
  it('gets called when the button is clicked', async () => {
    const onAddRow = jest.fn();
    const { getByText } = render(
      <table>
        <tbody>
          <AddTableRowButton colSpan={1} onAddRow={onAddRow} />
        </tbody>
      </table>
    );

    await userEvent.click(getByText('Add row'));

    expect(onAddRow).toHaveBeenCalledTimes(1);
  });
});
