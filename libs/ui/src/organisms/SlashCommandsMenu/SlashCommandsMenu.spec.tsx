import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SlashCommandsMenu } from './SlashCommandsMenu';

it('renders menuitems triggering different commands', () => {
  const handleExecute = jest.fn();
  const { getByText } = render(<SlashCommandsMenu onExecute={handleExecute} />);

  userEvent.click(getByText(/calculation/i));
  expect(handleExecute).toHaveBeenLastCalledWith(
    expect.stringContaining('calculation')
  );

  userEvent.click(getByText(/main.+heading/));
  expect(handleExecute).toHaveBeenLastCalledWith(
    expect.stringContaining('heading')
  );
});

it('focuses menuitems using the arrow keys', () => {
  const handleExecute = jest.fn();
  render(<SlashCommandsMenu onExecute={handleExecute} />);

  userEvent.keyboard('{arrowdown}{enter}');
  expect(handleExecute).toHaveBeenCalledTimes(1);

  userEvent.keyboard('{arrowdown}{enter}');
  expect(handleExecute).toHaveBeenCalledTimes(2);

  const [[firstCommand], [secondCommand]] = handleExecute.mock.calls;
  expect(secondCommand).not.toEqual(firstCommand);

  userEvent.keyboard('{arrowup}{enter}');
  expect(handleExecute).toHaveBeenCalledTimes(3);

  const [, , [thirdCommand]] = handleExecute.mock.calls;
  expect(thirdCommand).toEqual(firstCommand);
});
it('does not focus menuitems when holding shift', () => {
  const handleExecute = jest.fn();
  render(<SlashCommandsMenu onExecute={handleExecute} />);

  userEvent.keyboard('{shift}{arrowdown}{/shift}{enter}');
  expect(handleExecute).not.toBeCalled();
});
it('focuses menuitems using tab and shift+tab', () => {
  const handleExecute = jest.fn();
  render(<SlashCommandsMenu onExecute={handleExecute} />);

  userEvent.tab();
  userEvent.keyboard('{enter}');
  expect(handleExecute).toHaveBeenCalledTimes(1);

  userEvent.tab();
  userEvent.keyboard('{enter}');
  expect(handleExecute).toHaveBeenCalledTimes(2);

  const [[firstCommand], [secondCommand]] = handleExecute.mock.calls;
  expect(secondCommand).not.toEqual(firstCommand);

  userEvent.tab({ shift: true });
  userEvent.keyboard('{enter}');
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
    expect(getAllByRole('menuitem')).toHaveLength(3);

    expect(getByText(/main.+heading/)).toBeInTheDocument();
    expect(getByText(/secondary.+heading/)).toBeInTheDocument();
  });

  it('affects arrow key selection', () => {
    const handleExecute = jest.fn();
    const { getAllByRole } = render(
      <SlashCommandsMenu search="calc" onExecute={handleExecute} />
    );

    expect(getAllByRole('menuitem')).toHaveLength(1);

    userEvent.keyboard('{arrowdown}{enter}');
    expect(handleExecute).toHaveBeenCalledTimes(1);
    const [[firstCommand]] = handleExecute.mock.calls;
    handleExecute.mockClear();

    userEvent.keyboard('{arrowdown}{enter}');
    expect(handleExecute).toHaveBeenCalledTimes(1);
    const [[secondCommand]] = handleExecute.mock.calls;

    expect(secondCommand).toEqual(firstCommand);
  });

  it('resets the selection when changing', () => {
    const handleExecute = jest.fn();
    const { rerender } = render(
      <SlashCommandsMenu onExecute={handleExecute} />
    );

    userEvent.keyboard('{arrowdown}');
    rerender(<SlashCommandsMenu onExecute={handleExecute} search="a" />);
    userEvent.keyboard('{enter}');
    expect(handleExecute).not.toHaveBeenCalled();
  });
});
