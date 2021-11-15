import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SlashCommandsMenu } from './SlashCommandsMenu';

it('renders menuitems triggering different commands', () => {
  const handleExecute = jest.fn();
  const { getByText } = render(<SlashCommandsMenu onExecute={handleExecute} />);

  userEvent.click(getByText(/import data/i));
  expect(handleExecute).toHaveBeenLastCalledWith(
    expect.stringContaining('import')
  );

  userEvent.click(getByText(/heading.*1/i));
  expect(handleExecute).toHaveBeenLastCalledWith(
    expect.stringMatching(/heading.*1/)
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
