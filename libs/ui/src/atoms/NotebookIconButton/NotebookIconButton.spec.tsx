import { render, screen } from '@testing-library/react';
import { NotebookIconButton } from './NotebookIconButton';

describe('Notebook icon button', () => {
  it('renders the children', () => {
    render(
      <NotebookIconButton onClick={jest.fn()}>i'm an icon</NotebookIconButton>
    );

    expect(screen.getByText(/i'm an icon/i)).toBeInTheDocument();
  });
});
