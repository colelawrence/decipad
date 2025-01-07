import { describe, vi, it, expect } from 'vitest';
import { act, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AutoCompleteMenu } from './AutoCompleteMenu';
import { AutocompleteName } from '@decipad/language-interfaces';

describe('AutoCompleteMenu', () => {
  const identifiers: AutocompleteName[] = [
    {
      autocompleteGroup: 'variable',
      name: 'Revenue',
      kind: 'number',
    },
    {
      autocompleteGroup: 'variable' as const,
      name: 'Profit',
      kind: 'number',
    },
    {
      autocompleteGroup: 'variable' as const,
      name: 'Losses',
      kind: 'number',
    },
    {
      name: 'Sales',
      autocompleteGroup: 'variable' as const,
      kind: 'table',
    },
    {
      name: 'Client',
      blockId: 'table:sales',
      columnId: 'table:sales:column:client',
      autocompleteGroup: 'column' as const,
      kind: 'number',
      inTable: 'Sales',
    },
    {
      name: 'Profit',
      blockId: 'table:sales',
      columnId: 'table:sales:column:profit',
      autocompleteGroup: 'column' as const,
      kind: 'number',
      inTable: 'Sales',
    },
  ];

  it('renders menuitems triggering different commands', async () => {
    const handleExecute = vi.fn();
    const { getByText } = render(
      <AutoCompleteMenu
        onExecuteItem={handleExecute}
        identifiers={identifiers}
      />
    );

    await act(() => userEvent.click(getByText(/Revenue/i)));
    expect(handleExecute).toHaveBeenLastCalledWith(
      expect.objectContaining({
        autocompleteGroup: 'variable',
        name: 'Revenue',
      })
    );

    await act(() => userEvent.click(getByText(/Losses/)));
    expect(handleExecute).toHaveBeenLastCalledWith(
      expect.objectContaining({
        autocompleteGroup: 'variable',
        name: 'Losses',
      })
    );
  });

  it.skip('focuses menuitems using the arrow keys', async () => {
    const handleExecute = vi.fn();
    render(
      <AutoCompleteMenu
        onExecuteItem={handleExecute}
        identifiers={identifiers}
      />
    );

    await act(() => userEvent.keyboard('{arrowdown}{enter}'));
    expect(handleExecute).toHaveBeenCalledTimes(1);

    await act(() => userEvent.keyboard('{arrowup}{enter}'));

    const [[firstCommand], [secondCommand]] = handleExecute.mock.calls;
    expect(secondCommand).not.toEqual(firstCommand);
  });

  it('does not focus menuitems when holding shift', async () => {
    const handleExecute = vi.fn();
    render(
      <AutoCompleteMenu
        onExecuteItem={handleExecute}
        identifiers={identifiers}
      />
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
          [
            "Revenue",
          ]
        `);

      expect(getByText(/Rev/)).toBeInTheDocument();
    });

    it('updates pre-selected first option', () => {
      const handleExecute = vi.fn();
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
          [
            "Losses",
            "Profit",
            "Profit",
          ]
        `);
    });

    it('affects arrow key selection', async () => {
      const handleExecute = vi.fn();
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
});
