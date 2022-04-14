import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentProps } from 'react';
import { mockConsoleWarn } from '@decipad/testutils';
import { applyCssVars, findParentWithStyle } from '@decipad/dom-test-utils';
import { SlashCommandsMenuItem } from './SlashCommandsMenuItem';

const props: ComponentProps<typeof SlashCommandsMenuItem> = {
  title: 'Title',
  description: 'Description',
  icon: <svg />,
  enabled: true,
};

mockConsoleWarn();
let cleanup: undefined | (() => void);
afterEach(() => cleanup?.());

it('shows a pseudo-focused state', async () => {
  const { rerender, getByText } = render(
    <SlashCommandsMenuItem {...props} focused={false} title="Title" />
  );
  cleanup = await applyCssVars();
  const normalBackgroundColor = findParentWithStyle(
    getByText('Title'),
    'backgroundColor'
  )!.backgroundColor;
  cleanup();

  rerender(<SlashCommandsMenuItem {...props} focused title="Title" />);
  cleanup = await applyCssVars();
  const focusedBackgroundColor = findParentWithStyle(
    getByText('Title'),
    'backgroundColor'
  )!.backgroundColor;

  expect(focusedBackgroundColor).not.toEqual(normalBackgroundColor);
});

describe('an execute event', () => {
  it('is emitted on click', async () => {
    const handleExecute = jest.fn();
    const { getByText } = render(
      <SlashCommandsMenuItem
        {...props}
        title="Title"
        onExecute={handleExecute}
      />
    );

    await userEvent.click(getByText('Title'));
    expect(handleExecute).toHaveBeenCalled();
  });

  it('is emitted on pressing enter when focused', async () => {
    const handleExecute = jest.fn();
    render(
      <SlashCommandsMenuItem
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
    const handleExecute = jest.fn();
    render(
      <SlashCommandsMenuItem
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
    const handleExecute = jest.fn();
    render(
      <SlashCommandsMenuItem
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
