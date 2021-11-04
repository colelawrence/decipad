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
