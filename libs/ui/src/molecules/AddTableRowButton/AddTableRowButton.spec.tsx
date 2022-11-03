import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddTableRowButton } from './AddTableRowButton';

it('renders the text', () => {
  render(
    <table>
      <tbody>
        <AddTableRowButton />
      </tbody>
    </table>
  );

  expect(screen.getByText('Add row')).toBeVisible();
});

describe('onAddRow prop', () => {
  it('gets called when the button is clicked', async () => {
    const onAddRow = jest.fn();
    render(
      <table>
        <tbody>
          <AddTableRowButton onAddRow={onAddRow} />
        </tbody>
      </table>
    );

    await userEvent.click(screen.getByText('Add row'));

    expect(onAddRow).toHaveBeenCalledTimes(1);
  });
});
