import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SlashCommandsMenu } from './SlashCommandsMenu';

it('renders menuitems triggering different commands', async () => {
  const handleExecute = jest.fn();
  const { getByText, getByTestId } = render(
    <SlashCommandsMenu onExecute={handleExecute} />
  );

  await userEvent.click(getByTestId('menu-item-calculation-block'));
  expect(handleExecute).toHaveBeenLastCalledWith(
    expect.stringContaining('calculation')
  );

  await userEvent.click(getByText(/main.+heading/i));
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
  expect(handleExecute).not.toHaveBeenCalled();
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
  it("doesn't search by description", () => {
    const { queryAllByRole } = render(<SlashCommandsMenu search="secondary" />);

    expect(queryAllByRole('menuitem')).toHaveLength(0);
  });

  it("doesn't search by group", () => {
    const { queryAllByRole } = render(<SlashCommandsMenu search="text" />);

    expect(queryAllByRole('group')).toHaveLength(0);
    expect(queryAllByRole('menuitem')).toHaveLength(0);
  });

  it('affects arrow key selection', async () => {
    const handleExecute = jest.fn();
    const { getAllByRole } = render(
      <SlashCommandsMenu search="advanced formula" onExecute={handleExecute} />
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
