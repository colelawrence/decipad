import { render } from '@testing-library/react';
import { NotebookAvatar } from './NotebookAvatar';

describe('Pad Avatar', () => {
  it('does not render the user name or permission when not visible', () => {
    const { queryByText } = render(
      <NotebookAvatar name="John Doe" permission="Admin" />
    );

    expect(queryByText(/john doe/i)).toBeNull();
    expect(queryByText(/admin/i)).toBeNull();
  });

  it('renders the user name', () => {
    const { getByText } = render(
      <NotebookAvatar name="John Doe" permission="Admin" visible />
    );

    expect(getByText(/john doe/i)).toBeVisible();
  });

  it('renders the user permission', () => {
    const { getByText } = render(
      <NotebookAvatar name="John Doe" permission="Admin" visible />
    );

    expect(getByText(/admin/i)).toBeVisible();
  });
});
