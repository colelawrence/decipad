import { noop } from '@decipad/utils';
import { act, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentProps } from 'react';
import { CreateOrEditSectionModal } from './CreateOrEditSectionModal';

const props: ComponentProps<typeof CreateOrEditSectionModal> = {
  onClose: noop,
  onSubmit: noop,
};

it('cannot create a section in its initial state', () => {
  const { getByRole } = render(<CreateOrEditSectionModal {...props} />);
  expect(getByRole('button')).toBeDisabled();
});

it('emits a create event when typings a section name and submitting', async () => {
  const handleCreate = jest.fn();
  const { getByRole, getByPlaceholderText } = render(
    <CreateOrEditSectionModal {...props} onSubmit={handleCreate} />
  );

  await userEvent.type(getByPlaceholderText(/section/i), 'My section');
  await userEvent.click(getByRole('button'));
  await act(async () => {
    await waitFor(() =>
      expect(handleCreate).toHaveBeenCalledWith('My section')
    );
  });
});

it('disables section creation while already submitting', async () => {
  let resolveCreation!: () => void;
  const handleCreate = jest.fn().mockReturnValue(
    new Promise<void>((resolve) => {
      resolveCreation = resolve;
    })
  );
  const { getByRole, getByPlaceholderText } = render(
    <CreateOrEditSectionModal {...props} onSubmit={handleCreate} />
  );

  try {
    await userEvent.type(getByPlaceholderText(/section/i), 'My section');
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
