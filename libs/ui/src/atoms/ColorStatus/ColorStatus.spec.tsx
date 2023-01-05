import { render, screen } from '@testing-library/react';
import { ColorStatus } from './ColorStatus';

// eslint-disable-next-line jest/no-disabled-tests
describe.skip('Color status', () => {
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
