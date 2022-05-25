import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddNew } from './AddNew';

describe('Add New atom', () => {
  it('renders children', () => {
    render(<AddNew>text</AddNew>);
    expect(screen.getByText('text')).toBeVisible();
  });

  it('renders an add button', () => {
    render(<AddNew>text</AddNew>);

    const button = screen.getByTitle(/add/i).closest('button');

    expect(button).toBeInTheDocument();
  });

  it('onAdd gets called when button is clicked', async () => {
    const onAdd = jest.fn();
    render(<AddNew onAdd={onAdd}>text</AddNew>);

    expect(onAdd).toHaveBeenCalledTimes(0);
    await userEvent.click(screen.getByRole('button', { hidden: true }));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });
});
