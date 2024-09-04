import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ColorStatus } from './ColorStatus';

describe('Color status', () => {
  it('renders the color status as the background', () => {
    render(<ColorStatus name="done" selected={false} />);
    expect(getComputedStyle(screen.getByText('done')).visibility).toBe(
      'visible'
    );
  });

  it('doesnt crash just because it has a bad name', () => {
    render(<ColorStatus name={undefined as any} selected={false} />);
    expect(getComputedStyle(screen.getByText('draft')).visibility).toBe(
      'visible'
    );
  });
});
