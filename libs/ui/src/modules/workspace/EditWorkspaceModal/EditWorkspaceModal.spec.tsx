import { describe, it, expect, vi } from 'vitest';
import { act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentProps } from 'react';
import { EditWorkspaceModal } from './EditWorkspaceModal';
import { renderWithRouter } from '../../../test-utils/renderWithRouter';
import { noop } from '@decipad/utils';

const props: ComponentProps<typeof EditWorkspaceModal> = {
  name: 'Workspace',
  onClose: noop,
  membersHref: '',
};

it('prepopulates the rename field with the old name', () => {
  const { getByPlaceholderText } = renderWithRouter(
    <EditWorkspaceModal {...props} name="Example Workspace" />
  );
  expect(getByPlaceholderText(/renamed/i)).toHaveValue('Example Workspace');
});

it('cannot rename to the old name', () => {
  const { getByText } = renderWithRouter(<EditWorkspaceModal {...props} />);
  expect(getByText(/rename/i, { selector: 'button' })).toBeDisabled();
});

it('cannot rename to an empty name', async () => {
  const { getByText, getByPlaceholderText } = renderWithRouter(
    <EditWorkspaceModal {...props} />
  );
  await userEvent.clear(getByPlaceholderText(/renamed/i));
  expect(getByText(/rename/i, { selector: 'button' })).toBeDisabled();
});

it('emits a rename event when typing a new workspace name and submitting', async () => {
  const handleRename = vi.fn();
  const { getByText, getByPlaceholderText } = renderWithRouter(
    <EditWorkspaceModal {...props} onRename={handleRename} />
  );

  await userEvent.type(getByPlaceholderText(/renamed/i), 'new');
  await userEvent.click(getByText(/rename/i, { selector: 'button' }));

  await waitFor(() =>
    expect(handleRename).toHaveBeenCalledWith(expect.stringMatching(/new$/))
  );
});

describe('with allowDelete', () => {
  it('doesnt show a delete button', () => {
    const { queryByText } = renderWithRouter(
      <EditWorkspaceModal {...props} allowDelete={false} />
    );
    expect(
      queryByText(/delete/i, { selector: 'button' })
    ).not.toBeInTheDocument();
  });

  it('shows a delete button', () => {
    const { getByText } = renderWithRouter(
      <EditWorkspaceModal {...props} allowDelete />
    );
    expect(getByText(/delete/i, { selector: 'button' })).toBeInTheDocument();
  });

  it('cannot delete without typing the confirmation prompt', () => {
    const { getByText } = renderWithRouter(
      <EditWorkspaceModal {...props} allowDelete />
    );
    expect(getByText(/delete/i, { selector: 'button' })).toBeDisabled();
  });

  it('emits a delete event when typing the workspace name into the confirmation prompt and submitting', async () => {
    const handleDelete = vi.fn();
    const { getByText, getByPlaceholderText } = renderWithRouter(
      <EditWorkspaceModal
        {...props}
        name="The Name"
        onDelete={handleDelete}
        allowDelete
      />
    );

    await userEvent.type(getByPlaceholderText(/workspace name/i), 'The Name');
    await userEvent.click(getByText(/delete/i, { selector: 'button' }));

    await waitFor(() => expect(handleDelete).toHaveBeenCalled());
  });

  it('disables all buttons while deleting', async () => {
    let resolveDeletion!: () => void;
    const handleDelete = vi.fn().mockReturnValue(
      new Promise<void>((resolve) => {
        resolveDeletion = resolve;
      })
    );
    const { getByText, getByPlaceholderText } = renderWithRouter(
      <EditWorkspaceModal
        {...props}
        name="The Name"
        onDelete={handleDelete}
        allowDelete
      />
    );

    await userEvent.type(getByPlaceholderText(/workspace name/i), 'The Name');
    await userEvent.click(getByText(/delete/i, { selector: 'button' }));

    expect(getByText(/rename/i, { selector: 'button' })).toBeDisabled();
    expect(getByText(/delete/i, { selector: 'button' })).toBeDisabled();
    await act(() => {
      resolveDeletion();
    });
    await waitFor(() => {
      expect(getByText(/delete/i, { selector: 'button' })).not.toBeDisabled();
    });
  });
});
