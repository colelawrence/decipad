import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AutoCompleteMenu } from './AutoCompleteMenu';

const identifiers = ['OneVar', 'OtherVar', 'AnotherVar'].map((n) => ({
  kind: 'variable' as const,
  identifier: n,
  type: 'number',
}));

it('renders menuitems triggering different commands', async () => {
  const handleExecute = jest.fn();
  const { getByText } = render(
    <AutoCompleteMenu onExecuteItem={handleExecute} identifiers={identifiers} />
  );

  await userEvent.click(getByText(/One/i));
  expect(handleExecute).toHaveBeenLastCalledWith(
    expect.objectContaining({ kind: 'variable', identifier: 'OneVar' })
  );

  await userEvent.click(getByText(/Another/));
  expect(handleExecute).toHaveBeenLastCalledWith(
    expect.objectContaining({ kind: 'variable', identifier: 'AnotherVar' })
  );
});

it('does not select when pressing enter', async () => {
  const handleExecute = jest.fn();
  render(
    <AutoCompleteMenu onExecuteItem={handleExecute} identifiers={identifiers} />
  );

  expect(handleExecute).not.toHaveBeenCalled();
});

it('focuses menuitems using the arrow keys', async () => {
  const handleExecute = jest.fn();
  render(
    <AutoCompleteMenu onExecuteItem={handleExecute} identifiers={identifiers} />
  );

  await userEvent.keyboard('{arrowdown}{enter}');
  expect(handleExecute).toHaveBeenCalledTimes(1);

  await userEvent.keyboard('{arrowup}{enter}');
  expect(handleExecute).toHaveBeenCalledTimes(2);

  const [[firstCommand], [secondCommand]] = handleExecute.mock.calls;
  expect(secondCommand).not.toEqual(firstCommand);
});
it('does not focus menuitems when holding shift', async () => {
  const handleExecute = jest.fn();
  render(
    <AutoCompleteMenu onExecuteItem={handleExecute} identifiers={identifiers} />
  );

  await userEvent.keyboard('{Shift>}{arrowdown}{enter}');
  expect(handleExecute).not.toBeCalled();
});

describe('search', () => {
  it('filters out non-matching groups and items', async () => {
    const { getByText, getAllByRole } = render(
      <AutoCompleteMenu search="One" identifiers={identifiers} />
    );

    expect(getAllByRole('group')).toHaveLength(1);
    expect(getAllByRole('menuitem')).toHaveLength(1);

    expect(getByText(/OneVar/)).toBeInTheDocument();
  });

  it('updates pre-selected first option', async () => {
    const handleExecute = jest.fn();
    const { rerender, getAllByRole } = render(
      <AutoCompleteMenu
        identifiers={identifiers}
        search="O"
        onExecuteItem={handleExecute}
      />
    );
    expect(getAllByRole('menuitem')).toHaveLength(3);
    expect(getAllByRole('menuitem')[0].textContent).toMatchInlineSnapshot(
      `"NumberOneVar"`
    );

    rerender(
      <AutoCompleteMenu
        identifiers={identifiers}
        search="Other"
        onExecuteItem={handleExecute}
      />
    );
    expect(getAllByRole('menuitem')).toHaveLength(2);
    expect(getAllByRole('menuitem')[0].textContent).toMatchInlineSnapshot(
      `"NumberOtherVar"`
    );

    rerender(
      <AutoCompleteMenu
        identifiers={identifiers}
        search="O"
        onExecuteItem={handleExecute}
      />
    );
    expect(getAllByRole('menuitem')).toHaveLength(3);
    expect(getAllByRole('menuitem')[0].textContent).toMatchInlineSnapshot(
      `"NumberOneVar"`
    );
  });

  it('affects arrow key selection', async () => {
    const handleExecute = jest.fn();
    const { getAllByRole } = render(
      <AutoCompleteMenu
        identifiers={identifiers}
        search="One"
        onExecuteItem={handleExecute}
      />
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
});
