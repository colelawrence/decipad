import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MenuWrapper as wrapper } from '../../test-utils';
import { InputMenuItem } from './InputMenuItem';

let user = userEvent.setup({ pointerEventsCheck: 0 });
beforeEach(() => {
  user = userEvent.setup({ pointerEventsCheck: 0 });
});

describe('onChange prop', () => {
  it('gets called when the input is changed', async () => {
    const result = 'text';
    const onChange = jest.fn();
    render(<InputMenuItem onChange={onChange} />, {
      wrapper,
    });

    await user.type(screen.getByRole('textbox'), result);
    expect(onChange).toHaveBeenCalledTimes(result.length);
    expect(onChange).toHaveBeenCalledWith(result);
  });
});
