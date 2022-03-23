import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddNew } from './AddNew';

it('renders children', () => {
  const { getByText } = render(<AddNew>text</AddNew>);
  expect(getByText('text')).toBeVisible();
});

it('renders an add button', () => {
  const { getByTitle } = render(<AddNew>text</AddNew>);

  const button = getByTitle(/add/i).closest('button');

  expect(button).toBeInTheDocument();
});

describe('onAdd prop', () => {
  it('gets called when button is clicked', () => {
    const onAdd = jest.fn();
    const { getByRole } = render(<AddNew onAdd={onAdd}>text</AddNew>);

    expect(onAdd).toHaveBeenCalledTimes(0);
    userEvent.click(getByRole('button', { hidden: true }));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });
});
