import { SerializedUnits } from '@decipad/language';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MenuWrapper as wrapper } from '../../test-utils';
import { UnitMenuItem } from './UnitMenuItem';

it('renders the children', () => {
  const { getByRole, queryByRole } = render(<UnitMenuItem />, { wrapper });
  expect(getByRole('textbox')).toBeInTheDocument();
  expect(queryByRole('button')).toBeNull();
});

it('renders a button when parse is successful', async () => {
  // Parse always fails.
  const { getByRole, findByRole, queryByRole, rerender } = render(
    <UnitMenuItem parseUnit={() => Promise.resolve(null)} />,
    {
      wrapper,
    }
  );

  expect(queryByRole('button')).toBeNull();

  userEvent.type(getByRole('textbox'), 'm/s');
  await expect(findByRole('button')).rejects.toThrow();

  // Parse always succedes.
  rerender(
    <UnitMenuItem parseUnit={() => Promise.resolve({} as SerializedUnits)} />
  );

  expect(await findByRole('button')).toBeInTheDocument();
});

describe('onSelect prop', () => {
  it('gets called when parse is successful and button is pressed', async () => {
    const onSelect = jest.fn();
    const { getByRole, findByRole } = render(
      <UnitMenuItem
        onSelect={onSelect}
        parseUnit={() => Promise.resolve({} as SerializedUnits)}
      />,
      {
        wrapper,
      }
    );

    userEvent.type(getByRole('textbox'), 'm/s');
    expect(onSelect).not.toHaveBeenCalled();

    userEvent.click(await findByRole('button'));
    expect(onSelect).toHaveBeenCalled();
  });

  it('gets called when parse is successful and Enter is pressed', async () => {
    const onSelect = jest.fn();
    const { getByRole, findByRole } = render(
      <UnitMenuItem
        onSelect={onSelect}
        parseUnit={() => Promise.resolve({} as SerializedUnits)}
      />,
      {
        wrapper,
      }
    );

    userEvent.type(getByRole('textbox'), 'm/s');
    expect(onSelect).not.toHaveBeenCalled();

    await findByRole('button');
    userEvent.keyboard(`{enter}`);
    expect(onSelect).toHaveBeenCalled();
  });

  it('does not gets called when parse is unsuccessful', async () => {
    const onSelect = jest.fn();
    const { getByRole, findByRole } = render(
      <UnitMenuItem
        onSelect={onSelect}
        parseUnit={() => Promise.resolve(null)}
      />,
      {
        wrapper,
      }
    );

    userEvent.type(getByRole('textbox'), 'm/s');
    expect(onSelect).not.toHaveBeenCalled();
    await expect(findByRole('button')).rejects.toThrow();
    userEvent.keyboard(`{enter}`);
    expect(onSelect).toHaveBeenCalled();
  });
});
