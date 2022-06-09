import { applyCssVars, findParentWithStyle } from '@decipad/dom-test-utils';
import { mockConsoleWarn } from '@decipad/testutils';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentProps } from 'react';
import { AutoCompleteMenuItem } from './AutoCompleteMenuItem';

const props: ComponentProps<typeof AutoCompleteMenuItem> = {
  kind: 'variable',
  identifier: 'MyVariable',
  type: 'number',
};

mockConsoleWarn();
let cleanup: undefined | (() => void);
afterEach(() => cleanup?.());

it('shows a pseudo-focused state', async () => {
  const { rerender } = render(
    <AutoCompleteMenuItem {...props} focused={false} />
  );
  cleanup = await applyCssVars();
  const normalBackgroundColor = findParentWithStyle(
    screen.getByText('MyVariable'),
    'backgroundColor'
  )!.backgroundColor;
  cleanup();

  rerender(<AutoCompleteMenuItem {...props} focused />);
  cleanup = await applyCssVars();
  const focusedBackgroundColor = findParentWithStyle(
    screen.getByText('MyVariable'),
    'backgroundColor'
  )!.backgroundColor;

  expect(focusedBackgroundColor).not.toEqual(normalBackgroundColor);
});

describe('an execute event', () => {
  it('is emitted on click', async () => {
    const handleExecute = jest.fn();
    render(<AutoCompleteMenuItem {...props} onExecute={handleExecute} />);

    await userEvent.click(screen.getByText('MyVariable'));
    expect(handleExecute).toHaveBeenCalled();
  });

  it('is emitted on pressing enter when focused', async () => {
    const handleExecute = jest.fn();
    render(
      <AutoCompleteMenuItem {...props} focused onExecute={handleExecute} />
    );

    await userEvent.keyboard(`{enter}`);
    expect(handleExecute).toHaveBeenCalled();
  });
  it('is not emitted when not focused', async () => {
    const handleExecute = jest.fn();
    render(
      <AutoCompleteMenuItem
        {...props}
        focused={false}
        onExecute={handleExecute}
      />
    );

    await userEvent.keyboard('{enter}');
    expect(handleExecute).not.toHaveBeenCalled();
  });
  it('is not emitted when holding shift', async () => {
    const handleExecute = jest.fn();
    render(
      <AutoCompleteMenuItem {...props} focused onExecute={handleExecute} />
    );

    await userEvent.keyboard('{Shift>}{enter}');
    expect(handleExecute).not.toHaveBeenCalled();
  });
});
