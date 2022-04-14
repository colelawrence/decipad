import { fireEvent, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tooltip } from './Tooltip';

it('renders trigger', () => {
  const { getByText } = render(<Tooltip trigger={<span>Trigger</span>} />);
  expect(getByText('Trigger')).toBeInTheDocument();
});

it('renders tooltip when hovering the trigger', async () => {
  const { findByText, getByText, queryByText } = render(
    <Tooltip trigger={<span>Trigger</span>}>Content</Tooltip>
  );
  expect(await queryByText('Content')).toBeNull();

  await userEvent.hover(getByText('Trigger'));
  expect(await findByText('Content')).toBeInTheDocument();
});

it('hides the tooltip when starting to drag', async () => {
  const { findByText, getByText, queryByText } = render(
    <Tooltip trigger={<span>Trigger</span>}>Content</Tooltip>
  );
  expect(await queryByText('Content')).toBeNull();

  await userEvent.hover(getByText('Trigger'));
  expect(await findByText('Content')).toBeInTheDocument();

  fireEvent.mouseDown(getByText('Trigger'));
  fireEvent.mouseMove(getByText('Trigger'), { buttons: 1 });
  expect(await queryByText('Content')).toBeNull();
});
