import { ComponentProps } from 'react';
import { ClosableModal } from './ClosableModal';
import { renderWithRouter } from '../../test-utils/renderWithRouter';

const props: ComponentProps<typeof ClosableModal> = {
  Heading: 'h1',
  title: 'Title',
  children: 'Content',
  closeAction: '/',
};

it('renders a dialog with the children', () => {
  const { getByRole } = renderWithRouter(
    <ClosableModal {...props}>Content</ClosableModal>
  );
  expect(getByRole('dialog')).toHaveTextContent(/Content/);
});

it('renders a dialog with the title', () => {
  const { getByRole } = renderWithRouter(
    <ClosableModal {...props} title="Title" />
  );
  expect(getByRole('dialog')).toHaveTextContent(/Title/);
});
