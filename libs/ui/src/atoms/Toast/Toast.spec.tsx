import { applyCssVars, findParentWithStyle } from '@decipad/dom-test-utils';
import { mockConsoleWarn } from '@decipad/testutils';
import { render } from '@testing-library/react';
import { Toast } from './Toast';

describe('Toast atom', () => {
  mockConsoleWarn();
  let cleanup: undefined | (() => void);
  afterEach(() => cleanup?.());

  it('renders a different background when success', async () => {
    const { rerender, getByText } = render(
      <Toast appearance="info">toast</Toast>
    );
    cleanup = await applyCssVars();
    const { backgroundColor: infoColor } = findParentWithStyle(
      getByText('toast'),
      'backgroundColor'
    )!;

    cleanup();

    rerender(<Toast appearance="success">toast</Toast>);
    cleanup = await applyCssVars();
    const { backgroundColor: successColor } = findParentWithStyle(
      getByText('toast'),
      'backgroundColor'
    )!;

    expect(infoColor).not.toBe(successColor);
  });
});
