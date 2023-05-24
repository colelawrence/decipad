import { timeout } from '@decipad/utils';
import { act, render } from '@testing-library/react';
import { runCode } from '../../test-utils';
import { InlineColumnResult } from './InlineColumnResult';

describe('InlineColumnResult', () => {
  it('renders value all values <= 3', async () => {
    const { container } = render(
      <InlineColumnResult {...await runCode('[10, 20, 30]')} />
    );

    await act(() => timeout(1000));

    expect(container.textContent).toBe('10, 20, 30');
  });

  it('renders value ellipsis if count > 3', async () => {
    const { container } = render(
      <InlineColumnResult {...await runCode('[10, 20, 30, 40]')} />
    );

    await act(() => timeout(1000));

    expect(container.textContent).toBe('10, 20, 30, …');
  });
});
