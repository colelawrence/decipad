import { decilang, SimpleValueAST } from '@decipad/remote-computer';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MenuWrapper as wrapper } from '../../test-utils';
import { ASTUnitMenuItem } from './ASTUnitMenuItem';

let user = userEvent.setup({ pointerEventsCheck: 0 });
beforeEach(() => {
  user = userEvent.setup({ pointerEventsCheck: 0 });
});

it('renders the children', () => {
  render(<ASTUnitMenuItem />, { wrapper });
  expect(screen.getByRole('textbox')).toBeInTheDocument();
  expect(screen.queryByRole('button')).toBeDisabled();
});

const goodUnit = decilang<SimpleValueAST>`m/s`;

it('renders a button when parse is successful', async () => {
  // Parse always fails.
  const { rerender } = render(<ASTUnitMenuItem parseUnit={() => undefined} />, {
    wrapper,
  });

  expect(screen.queryByRole('button')).toBeDisabled();

  await user.type(screen.getByRole('textbox'), 'm/s');

  // Parse always succedes.
  rerender(<ASTUnitMenuItem parseUnit={() => goodUnit} />);

  expect(await screen.findByRole('button')).toBeInTheDocument();
});

describe('onSelect prop', () => {
  it('gets called when parse is successful and button is pressed', async () => {
    const onSelect = jest.fn();
    render(<ASTUnitMenuItem onSelect={onSelect} parseUnit={() => goodUnit} />, {
      wrapper,
    });

    await user.type(screen.getByRole('textbox'), 'm/s');
    expect(onSelect).not.toHaveBeenCalled();

    await user.click(await screen.findByRole('button'));
    expect(onSelect).toHaveBeenCalled();
  });

  it('gets called when parse is successful and Enter is pressed', async () => {
    const onSelect = jest.fn();
    render(<ASTUnitMenuItem onSelect={onSelect} parseUnit={() => goodUnit} />, {
      wrapper,
    });

    await user.type(screen.getByRole('textbox'), 'm/s');
    expect(onSelect).not.toHaveBeenCalled();

    await screen.findByRole('button');
    await user.keyboard(`{enter}`);
    expect(onSelect).toHaveBeenCalled();
  });
});
