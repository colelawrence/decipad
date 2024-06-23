import { vi } from 'vitest';
import { mockConsoleWarn } from '@decipad/testutils';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentProps } from 'react';
import { InlineMenuItem } from './InlineMenuItem';

const props: ComponentProps<typeof InlineMenuItem> = {
  title: 'Title',
  description: 'Description',
  icon: <svg />,
  enabled: true,
};

mockConsoleWarn();
let cleanup: undefined | (() => void);
afterEach(() => cleanup?.());

describe('an execute event', () => {
  it('is emitted on click', async () => {
    const handleExecute = vi.fn();
    render(
      <InlineMenuItem {...props} title="Title" onExecute={handleExecute} />
    );

    await userEvent.click(screen.getByText('Title'));
    expect(handleExecute).toHaveBeenCalled();
  });

  it('is emitted on pressing enter when focused', async () => {
    const handleExecute = vi.fn();
    render(
      <InlineMenuItem
        {...props}
        title="Title"
        focused
        onExecute={handleExecute}
      />
    );

    await userEvent.keyboard(`{enter}`);
    expect(handleExecute).toHaveBeenCalled();
  });
  it('is not emitted when not focused', async () => {
    const handleExecute = vi.fn();
    render(
      <InlineMenuItem
        {...props}
        title="Title"
        focused={false}
        onExecute={handleExecute}
      />
    );

    await userEvent.keyboard('{enter}');
    expect(handleExecute).not.toHaveBeenCalled();
  });
  it('is not emitted when holding shift', async () => {
    const handleExecute = vi.fn();
    render(
      <InlineMenuItem
        {...props}
        title="Title"
        focused
        onExecute={handleExecute}
      />
    );

    await userEvent.keyboard('{Shift>}{enter}');
    expect(handleExecute).not.toHaveBeenCalled();
  });
});
