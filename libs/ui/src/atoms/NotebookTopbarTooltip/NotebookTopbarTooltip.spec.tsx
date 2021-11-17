import { render } from '@testing-library/react';
import { NotebookTopbarTooltip } from './NotebookTopbarTooltip';

describe('PadTopbar Tooltip', () => {
  it('does not display name or permission when not visible', () => {
    const { queryByText } = render(
      <NotebookTopbarTooltip name="John Doe" permission="Admin">
        <div>tooltip</div>
      </NotebookTopbarTooltip>
    );

    expect(queryByText(/john doe/i)).toBeNull();
    expect(queryByText(/admin/i)).toBeNull();
  });

  it('shows the user name', () => {
    const { getByText } = render(
      <NotebookTopbarTooltip name="John Doe" permission="Admin" visible>
        <div>tooltip</div>
      </NotebookTopbarTooltip>
    );

    expect(getByText(/john doe/i)).toBeVisible();
  });

  it('shows the user permission', () => {
    const { getByText } = render(
      <NotebookTopbarTooltip name="John Doe" permission="Admin" visible>
        <div>tooltip</div>
      </NotebookTopbarTooltip>
    );

    expect(getByText(/admin/i)).toBeVisible();
  });
});
