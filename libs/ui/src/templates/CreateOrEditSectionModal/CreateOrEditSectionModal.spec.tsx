import { noop } from '@decipad/utils';
import { act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentProps } from 'react';
import { CreateOrEditSectionModal } from './CreateOrEditSectionModal';
import { renderWithRouter } from '../../test-utils/renderWithRouter';

const props: ComponentProps<typeof CreateOrEditSectionModal> = {
  onClose: noop,
  onSubmit: noop,
};

it('cannot create a section in its initial state', () => {
  const { getByText } = renderWithRouter(
    <CreateOrEditSectionModal {...props} />
  );
  expect(getByText('Create Section')).toBeDisabled();
});

it('emits a create event when typings a section name and submitting', async () => {
  const handleCreate = jest.fn();
  const { getByText, getByPlaceholderText } = renderWithRouter(
    <CreateOrEditSectionModal {...props} onSubmit={handleCreate} />
  );

  await userEvent.type(getByPlaceholderText(/section/i), 'My section');
  await userEvent.click(getByText('Create Section'));
  await act(async () => {
    await waitFor(() => expect(handleCreate).toHaveBeenCalledTimes(1));
  });
});
