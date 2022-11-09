import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddTableRowButton } from './AddTableRowButton';

it('renders the text', () => {
  render(
    <table>
      <tbody>
        <tr>
          <AddTableRowButton />
        </tr>
      </tbody>
    </table>
  );

  expect(screen.getByText('Add row')).not.toBeVisible();
});

describe('onAddRow prop', () => {
  it('gets called when the button is clicked', async () => {
    const onAddRow = jest.fn();
    render(
      <table>
        <tbody>
          <tr>
            <AddTableRowButton onAddRow={onAddRow} />
          </tr>
        </tbody>
      </table>
    );

    await userEvent.click(screen.getByText('Add row'));

    expect(onAddRow).toHaveBeenCalledTimes(1);
  });
});
