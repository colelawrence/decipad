import { fireEvent, render } from '@testing-library/react';
import { NotebookIconButton } from './NotebookIconButton';

describe('Notebook icon button', () => {
  it('renders the children', () => {
    const { getByText } = render(
      <NotebookIconButton onClick={jest.fn()}>i'm an icon</NotebookIconButton>
    );

    expect(getByText(/i'm an icon/i)).toBeInTheDocument();
  });

  it('onclick handler runs when button is clicked', () => {
    const clickHandler = jest.fn();
    const { getByRole } = render(
      <NotebookIconButton onClick={clickHandler}>
        i'm an icon
      </NotebookIconButton>
    );

    fireEvent.click(getByRole('button'));

    expect(clickHandler).toHaveBeenCalled();
  });
});
