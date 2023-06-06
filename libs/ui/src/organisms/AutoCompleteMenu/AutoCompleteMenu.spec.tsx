import { act, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ACItemType } from '../../atoms/AutoCompleteMenuItem/AutoCompleteMenuItem';
import { AutoCompleteMenu } from './AutoCompleteMenu';

const identifiers = [
  {
    kind: 'variable' as const,
    identifier: 'Revenue',
    type: 'number' as ACItemType,
  },
  {
    kind: 'variable' as const,
    identifier: 'Profit',
    type: 'number' as ACItemType,
  },
  {
    kind: 'variable' as const,
    identifier: 'Losses',
    type: 'number' as ACItemType,
  },
  {
    identifier: 'Sales',
    kind: 'variable' as const,
    type: 'table' as ACItemType,
  },
  {
    identifier: 'Client',
    blockId: 'table:sales',
    columnId: 'table:sales:column:client',
    kind: 'column' as const,
    type: 'number' as ACItemType,
    inTable: 'Sales',
  },
  {
    identifier: 'Profit',
    blockId: 'table:sales',
    columnId: 'table:sales:column:profit',
    kind: 'column' as const,
    type: 'number' as ACItemType,
    inTable: 'Sales',
  },
];

it('renders menuitems triggering different commands', async () => {
  const handleExecute = jest.fn();
  const { getByText } = render(
    <AutoCompleteMenu onExecuteItem={handleExecute} identifiers={identifiers} />
  );

  await act(() => userEvent.click(getByText(/Revenue/i)));
  expect(handleExecute).toHaveBeenLastCalledWith(
    expect.objectContaining({ kind: 'variable', identifier: 'Revenue' })
  );

  await act(() => userEvent.click(getByText(/Losses/)));
  expect(handleExecute).toHaveBeenLastCalledWith(
    expect.objectContaining({ kind: 'variable', identifier: 'Losses' })
  );
});

it('focuses menuitems using the arrow keys', async () => {
  const handleExecute = jest.fn();
  render(
    <AutoCompleteMenu onExecuteItem={handleExecute} identifiers={identifiers} />
  );

  await act(() => userEvent.keyboard('{arrowdown}{enter}'));
  expect(handleExecute).toHaveBeenCalledTimes(1);

  await act(() => userEvent.keyboard('{arrowup}{enter}'));

  const [[firstCommand], [secondCommand]] = handleExecute.mock.calls;
  expect(secondCommand).not.toEqual(firstCommand);
});

it('does not focus menuitems when holding shift', async () => {
  const handleExecute = jest.fn();
  render(
    <AutoCompleteMenu onExecuteItem={handleExecute} identifiers={identifiers} />
  );

  await act(() => userEvent.keyboard('{Shift>}{arrowdown}{enter}'));
  expect(handleExecute).not.toHaveBeenCalled();
});

describe('search', () => {
  it('filters out non-matching groups and items', () => {
    const { getByText, getAllByRole } = render(
      <AutoCompleteMenu search="Rev" identifiers={identifiers} />
    );

    expect(getAllByRole('group')).toHaveLength(1);
    expect(getAllByRole('menuitem')).toHaveLength(1);

    expect(getAllByRole('menuitem').map((x) => x.textContent))
      .toMatchInlineSnapshot(`
      Array [
        "NumberRevenue",
      ]
    `);

    expect(getByText(/Rev/)).toBeInTheDocument();
  });

  it('updates pre-selected first option', () => {
    const handleExecute = jest.fn();
    const { getAllByRole } = render(
      <AutoCompleteMenu
        identifiers={identifiers}
        search="O"
        onExecuteItem={handleExecute}
      />
    );
    expect(getAllByRole('menuitem')).toHaveLength(3);
    expect(getAllByRole('menuitem').map((x) => x.textContent))
      .toMatchInlineSnapshot(`
      Array [
        "NumberLosses",
        "NumberProfit",
        "NumberProfit",
      ]
    `);
  });

  it('affects arrow key selection', async () => {
    const handleExecute = jest.fn();
    const { getAllByRole } = render(
      <AutoCompleteMenu
        identifiers={identifiers}
        search="Losses"
        onExecuteItem={handleExecute}
      />
    );

    expect(getAllByRole('menuitem')).toHaveLength(1);

    await act(() => userEvent.keyboard('{arrowdown}{enter}'));
    expect(handleExecute).toHaveBeenCalledTimes(1);
    const [[firstCommand]] = handleExecute.mock.calls;
    handleExecute.mockClear();

    await act(() => userEvent.keyboard('{arrowdown}{enter}'));
    expect(handleExecute).toHaveBeenCalledTimes(1);
    const [[secondCommand]] = handleExecute.mock.calls;

    expect(secondCommand).toEqual(firstCommand);
  });
});
