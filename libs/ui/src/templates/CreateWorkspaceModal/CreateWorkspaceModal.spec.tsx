import { act, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentProps } from 'react';
import { CreateWorkspaceModal } from './CreateWorkspaceModal';

const props: ComponentProps<typeof CreateWorkspaceModal> = {
  Heading: 'h1',
  closeHref: '',
};

it('cannot create a workspace in its initial state', () => {
  const { getByRole } = render(<CreateWorkspaceModal {...props} />);
  expect(getByRole('button')).toBeDisabled();
});

it('emits a create event when typings a workspace name and submitting', async () => {
  const handleCreate = jest.fn();
  const { getByRole, getByPlaceholderText } = render(
    <CreateWorkspaceModal {...props} onCreate={handleCreate} />
  );

  await userEvent.type(getByPlaceholderText(/workspace/i), 'My Workspace');
  await userEvent.click(getByRole('button'));
  await act(async () => {
    await waitFor(() =>
      expect(handleCreate).toHaveBeenCalledWith('My Workspace')
    );
  });
});

it('disables workspace creation while already submitting', async () => {
  let resolveCreation!: () => void;
  const handleCreate = jest.fn().mockReturnValue(
    new Promise<void>((resolve) => {
      resolveCreation = resolve;
    })
  );
  const { getByRole, getByPlaceholderText } = render(
    <CreateWorkspaceModal {...props} onCreate={handleCreate} />
  );

  try {
    await userEvent.type(getByPlaceholderText(/workspace/i), 'My Workspace');
    await userEvent.click(getByRole('button'));
    expect(getByRole('button')).toBeDisabled();
  } finally {
    await act(async () => {
      resolveCreation();
      await waitFor(() => {
        expect(getByRole('button')).not.toBeDisabled();
      });
    });
  }
});
