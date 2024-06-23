import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NotebookIconButton } from './NotebookIconButton';

describe('Notebook icon button', () => {
  it('renders the children', () => {
    render(
      <NotebookIconButton isDefaultBackground={true} onClick={vi.fn()}>
        i'm an icon
      </NotebookIconButton>
    );

    expect(screen.getByText(/i'm an icon/i)).toBeInTheDocument();
  });
});
