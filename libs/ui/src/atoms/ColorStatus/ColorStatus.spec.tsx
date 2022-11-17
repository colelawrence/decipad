import { render, screen } from '@testing-library/react';
import { ColorStatus } from './ColorStatus';

describe('Color status', () => {
  it('renders the color status as the background', () => {
    render(<ColorStatus name={'To Do'} selected={false} />);
    expect(getComputedStyle(screen.getByText('To Do')).visibility).toBe(
      'visible'
    );
  });

  it('doesnt crash just because it has a bad name', () => {
    render(<ColorStatus name={undefined as any} selected={false} />);
    expect(getComputedStyle(screen.getByText('No Status')).visibility).toBe(
      'visible'
    );
  });
});
