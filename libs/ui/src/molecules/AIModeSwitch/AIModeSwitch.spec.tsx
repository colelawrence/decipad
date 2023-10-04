import { render, screen } from '@testing-library/react';
import { AIModeSwitch } from './AIModeSwitch';
import { noop } from '@decipad/utils';

describe('has the right attribute', () => {
  it('renders switched off', () => {
    render(<AIModeSwitch onChange={noop} value={false} />);

    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });

  it('renders switched on', () => {
    render(<AIModeSwitch onChange={noop} value={true} />);

    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });
});
