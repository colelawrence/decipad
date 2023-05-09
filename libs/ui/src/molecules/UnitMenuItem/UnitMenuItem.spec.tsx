import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MenuWrapper as wrapper } from '../../test-utils';
import { UnitMenuItem } from './UnitMenuItem';

let user = userEvent.setup({ pointerEventsCheck: 0 });
beforeEach(() => {
  user = userEvent.setup({ pointerEventsCheck: 0 });
});

it('renders the children', () => {
  render(<UnitMenuItem />, { wrapper });
  expect(screen.getByRole('textbox')).toBeInTheDocument();
  expect(screen.queryByRole('button')).toBeNull();
});

it('renders a button when parse is successful', async () => {
  // Parse always fails.
  const { rerender } = render(
    <UnitMenuItem parseUnit={() => Promise.resolve(null)} />,
    {
      wrapper,
    }
  );

  expect(screen.queryByRole('button')).toBeNull();

  await user.type(screen.getByRole('textbox'), 'm/s');
  await expect(screen.findByRole('button')).rejects.toThrow();

  // Parse always succedes.
  rerender(<UnitMenuItem parseUnit={() => []} />);

  expect(await screen.findByRole('button')).toBeInTheDocument();
});

describe('onSelect prop', () => {
  it('gets called when parse is successful and button is pressed', async () => {
    const onSelect = jest.fn();
    render(<UnitMenuItem onSelect={onSelect} parseUnit={() => []} />, {
      wrapper,
    });

    await user.type(screen.getByRole('textbox'), 'm/s');
    expect(onSelect).not.toHaveBeenCalled();

    await user.click(await screen.findByRole('button'));
    expect(onSelect).toHaveBeenCalled();
  });

  it('gets called when parse is successful and Enter is pressed', async () => {
    const onSelect = jest.fn();
    render(<UnitMenuItem onSelect={onSelect} parseUnit={() => []} />, {
      wrapper,
    });

    await user.type(screen.getByRole('textbox'), 'm/s');
    expect(onSelect).not.toHaveBeenCalled();

    await screen.findByRole('button');
    await user.keyboard(`{enter}`);
    expect(onSelect).toHaveBeenCalled();
  });

  it('does not gets called when parse is unsuccessful', async () => {
    const onSelect = jest.fn();
    render(<UnitMenuItem onSelect={onSelect} parseUnit={() => null} />, {
      wrapper,
    });

    await user.type(screen.getByRole('textbox'), 'm/s');
    expect(onSelect).not.toHaveBeenCalled();
    await expect(screen.findByRole('button')).rejects.toThrow();
    await user.keyboard(`{enter}`);
    expect(onSelect).toHaveBeenCalled();
  });
});
