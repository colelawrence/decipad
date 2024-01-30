import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tooltip } from './Tooltip';

it('renders trigger', () => {
  render(<Tooltip trigger={<span>Trigger</span>} />);
  expect(screen.getByText('Trigger')).toBeInTheDocument();
});

it('renders tooltip when hovering the trigger', async () => {
  render(<Tooltip trigger={<span>Trigger</span>}>Content</Tooltip>);
  expect(screen.queryByText('Content')).toBeNull();

  await userEvent.hover(screen.getByText('Trigger'));
  expect(await screen.findByText('Content')).toBeInTheDocument();
});

it('hides the tooltip when starting to drag', async () => {
  render(<Tooltip trigger={<span>Trigger</span>}>Content</Tooltip>);
  expect(screen.queryByText('Content')).toBeNull();

  await userEvent.hover(screen.getByText('Trigger'));
  expect(await screen.findByText('Content')).toBeInTheDocument();

  fireEvent.mouseDown(screen.getByText('Trigger'));
  fireEvent.mouseMove(screen.getByText('Trigger'), { buttons: 1 });
  expect(screen.queryByText('Content')).toBeNull();
});
