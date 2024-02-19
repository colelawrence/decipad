import { noop } from '@decipad/utils';
import { act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentProps } from 'react';
import { CreateOrEditSectionModal } from './CreateOrEditSectionModal';
import { renderWithRouter } from '../../../test-utils/renderWithRouter';

const props: ComponentProps<typeof CreateOrEditSectionModal> = {
  onSubmit: noop,
  open: true,
  onOpenChange: noop,
};

it('cannot create a folder in its initial state', () => {
  const { getByText } = renderWithRouter(
    <CreateOrEditSectionModal {...props} />
  );
  expect(getByText('Create Folder')).toBeDisabled();
});

it('emits a create event when typings a folder name and submitting', async () => {
  const handleCreate = jest.fn();
  const { getByText, getByPlaceholderText } = renderWithRouter(
    <CreateOrEditSectionModal {...props} onSubmit={handleCreate} />
  );

  await userEvent.type(getByPlaceholderText(/folder/i), 'My folder');
  await userEvent.click(getByText('Create Folder'));
  await act(async () => {
    await waitFor(() => expect(handleCreate).toHaveBeenCalledTimes(1));
  });
});
