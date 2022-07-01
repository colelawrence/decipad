import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SlashCommandsMenu } from './SlashCommandsMenu';

it('renders menuitems triggering different commands', async () => {
  const handleExecute = jest.fn();
  const { getByText } = render(<SlashCommandsMenu onExecute={handleExecute} />);

  await userEvent.click(getByText(/calculation/i));
  expect(handleExecute).toHaveBeenLastCalledWith(
    expect.stringContaining('calculation')
  );

  await userEvent.click(getByText(/main.+heading/));
  expect(handleExecute).toHaveBeenLastCalledWith(
    expect.stringContaining('heading')
  );
});

it('focuses menuitems using the arrow keys', async () => {
  const handleExecute = jest.fn();
  render(<SlashCommandsMenu onExecute={handleExecute} />);

  await userEvent.keyboard('{arrowdown}{enter}');
  expect(handleExecute).toHaveBeenCalledTimes(1);

  await userEvent.keyboard('{arrowdown}{enter}');
  expect(handleExecute).toHaveBeenCalledTimes(2);

  const [[firstCommand], [secondCommand]] = handleExecute.mock.calls;
  expect(secondCommand).not.toEqual(firstCommand);

  await userEvent.keyboard('{arrowup}{enter}');
  expect(handleExecute).toHaveBeenCalledTimes(3);

  const [, , [thirdCommand]] = handleExecute.mock.calls;
  expect(thirdCommand).toEqual(firstCommand);
});
it('does not focus menuitems when holding shift', async () => {
  const handleExecute = jest.fn();
  render(<SlashCommandsMenu onExecute={handleExecute} />);

  await userEvent.keyboard('{Shift>}{arrowdown}{enter}');
  expect(handleExecute).not.toBeCalled();
});
it('focuses menuitems using tab and shift+tab', async () => {
  const handleExecute = jest.fn();
  render(<SlashCommandsMenu onExecute={handleExecute} />);

  await userEvent.tab();
  await userEvent.keyboard('{enter}');
  expect(handleExecute).toHaveBeenCalledTimes(1);

  await userEvent.tab();
  await userEvent.keyboard('{enter}');
  expect(handleExecute).toHaveBeenCalledTimes(2);

  const [[firstCommand], [secondCommand]] = handleExecute.mock.calls;
  expect(secondCommand).not.toEqual(firstCommand);

  await userEvent.tab({ shift: true });
  await userEvent.keyboard('{enter}');
  expect(handleExecute).toHaveBeenCalledTimes(3);

  const [, , [thirdCommand]] = handleExecute.mock.calls;
  expect(thirdCommand).toEqual(firstCommand);
});

describe('search', () => {
  it('filters out non-matching groups and items', () => {
    const { getByText, getAllByRole } = render(
      <SlashCommandsMenu search="secondary" />
    );

    expect(getAllByRole('group')).toHaveLength(1);
    expect(getAllByRole('menuitem')).toHaveLength(1);

    expect(getByText(/secondary.+heading/i)).toBeInTheDocument();
  });

  it('shows all group items if the group matches', () => {
    const { getByText, getAllByRole } = render(
      <SlashCommandsMenu search="text" />
    );

    expect(getAllByRole('group')).toHaveLength(1);
    expect(getAllByRole('menuitem')).toHaveLength(5);

    expect(getByText(/main.+heading/)).toBeInTheDocument();
    expect(getByText(/secondary.+heading/)).toBeInTheDocument();
  });

  it('affects arrow key selection', async () => {
    const handleExecute = jest.fn();
    const { getAllByRole } = render(
      <SlashCommandsMenu search="calc" onExecute={handleExecute} />
    );

    expect(getAllByRole('menuitem')).toHaveLength(1);

    await userEvent.keyboard('{arrowdown}{enter}');
    expect(handleExecute).toHaveBeenCalledTimes(1);
    const [[firstCommand]] = handleExecute.mock.calls;
    handleExecute.mockClear();

    await userEvent.keyboard('{arrowdown}{enter}');
    expect(handleExecute).toHaveBeenCalledTimes(1);
    const [[secondCommand]] = handleExecute.mock.calls;

    expect(secondCommand).toEqual(firstCommand);
  });

  it('updates the selection when changing', async () => {
    const handleExecute = jest.fn();
    const { rerender } = render(
      <SlashCommandsMenu onExecute={handleExecute} />
    );

    rerender(<SlashCommandsMenu onExecute={handleExecute} search="table" />);
    await userEvent.keyboard('{enter}');
    expect(handleExecute).toHaveBeenCalled();
  });
});
