import { timeout } from '@decipad/utils';
import { act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentProps } from 'react';
import { CreateWorkspaceModal } from './CreateWorkspaceModal';
import { renderWithRouter } from '../../test-utils/renderWithRouter';

const props: ComponentProps<typeof CreateWorkspaceModal> = {
  Heading: 'h1',
  closeHref: '',
};

it('cannot create a workspace in its initial state', () => {
  const { getByTestId } = renderWithRouter(<CreateWorkspaceModal {...props} />);
  expect(getByTestId('btn-create-modal')).toBeDisabled();
});

it('emits a create event when typings a workspace name and submitting', async () => {
  const handleCreate = jest.fn();
  const { getByTestId, getByPlaceholderText } = renderWithRouter(
    <CreateWorkspaceModal {...props} onCreate={handleCreate} />
  );

  await userEvent.type(getByPlaceholderText(/workspace/i), 'My Workspace');
  await userEvent.click(getByTestId('btn-create-modal'));
  await act(() => timeout(500));
  await waitFor(() =>
    expect(handleCreate).toHaveBeenCalledWith('My Workspace')
  );
}, 20_000);

it('disables workspace creation while already submitting', async () => {
  let resolveCreation!: () => void;
  const handleCreate = jest.fn().mockReturnValue(
    new Promise<void>((resolve) => {
      resolveCreation = resolve;
    })
  );
  const { getByTestId, getByPlaceholderText } = renderWithRouter(
    <CreateWorkspaceModal {...props} onCreate={handleCreate} />
  );

  await act(async () => {
    await userEvent.type(getByPlaceholderText(/workspace/i), 'My Workspace');
    await userEvent.click(getByTestId('btn-create-modal'));
  });
  expect(getByTestId('btn-create-modal')).toBeDisabled();
  await act(() => {
    resolveCreation();
  });
  await waitFor(() => {
    expect(getByTestId('btn-create-modal')).not.toBeDisabled();
  });
});
