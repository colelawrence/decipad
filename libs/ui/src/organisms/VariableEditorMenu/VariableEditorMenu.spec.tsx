import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentProps } from 'react';
import { VariableEditorMenu } from './VariableEditorMenu';

const props: ComponentProps<typeof VariableEditorMenu> = {
  trigger: <button>trigger</button>,
  variant: 'expression',
};

it('renders trigger icon', () => {
  const { getByText } = render(<VariableEditorMenu {...props} />);
  expect(getByText('trigger')).toBeInTheDocument();
});

it('renders the menu when trigger is clicked', async () => {
  const { findAllByRole, queryAllByRole, findByText } = render(
    <VariableEditorMenu {...props} />
  );
  expect(queryAllByRole('menuitem')).toHaveLength(0);

  await userEvent.click(await findByText(/trigger/i));

  expect(await findAllByRole('menuitem')).not.toHaveLength(0);
});

describe('variant prop', () => {
  it('renders different items depending on the variant', async () => {
    const { findAllByRole, findByText, rerender } = render(
      <VariableEditorMenu {...props} variant="expression" />
    );
    await userEvent.click(await findByText(/trigger/i));
    const expressionMenuItems = await findAllByRole('menuitem');

    rerender(<VariableEditorMenu {...props} variant="slider" />);
    const sliderMenuItems = await findAllByRole('menuitem');

    expect(expressionMenuItems).not.toHaveLength(0);
    expect(sliderMenuItems).not.toHaveLength(0);
    expect(expressionMenuItems.length).not.toBe(sliderMenuItems.length);
  });
});

describe.each([
  ['onCopy', /copy/i],
  ['onDelete', /delete/i],
])('%s prop', (prop, text) => {
  it('gets called when the respective item is clicked', async () => {
    const testProp = {
      [prop]: jest.fn(),
    };
    const { findByText } = render(
      <VariableEditorMenu {...props} {...testProp} />
    );

    await userEvent.click(await findByText(/trigger/i), {
      pointerEventsCheck: 0,
    });
    await userEvent.click(await findByText(text), {
      pointerEventsCheck: 0,
    });
    expect(testProp[prop]).toHaveBeenCalledTimes(1);
  });
});

it('errors when max is lower than min', async () => {
  const { findByDisplayValue, findByText } = render(
    <VariableEditorMenu {...props} variant="slider" max="0" min="10" />
  );

  await userEvent.click(await findByText(/trigger/i), {
    pointerEventsCheck: 0,
  });
  await userEvent.hover(await findByDisplayValue('0'), {
    pointerEventsCheck: 0,
  });
  expect(await findByText(/bigger.+than.+10/i)).toBeInTheDocument();

  await userEvent.hover(await findByDisplayValue('10'), {
    pointerEventsCheck: 0,
  });
  expect(await findByText(/lower.+than.+0/i)).toBeInTheDocument();
});

it('errors when step is lower or equal than zero', async () => {
  const { findByDisplayValue, findByText, rerender } = render(
    <VariableEditorMenu {...props} variant="slider" min="5" max="10" step="0" />
  );

  await userEvent.click(await findByText(/trigger/i), {
    pointerEventsCheck: 0,
  });
  await userEvent.hover(await findByDisplayValue('0'), {
    pointerEventsCheck: 0,
  });
  expect(await findByText(/bigger.+than.+0/i)).toBeInTheDocument();

  rerender(
    <VariableEditorMenu
      {...props}
      variant="slider"
      min="5"
      max="10"
      step="-1"
    />
  );

  await userEvent.hover(await findByDisplayValue('-1'), {
    pointerEventsCheck: 0,
  });
  expect(await findByText(/bigger.+than.+0/i)).toBeInTheDocument();
});

it('errors when step is bigger than the difference between min and max', async () => {
  const { findByDisplayValue, findByText } = render(
    <VariableEditorMenu {...props} variant="slider" min="5" max="10" step="6" />
  );

  await userEvent.click(await findByText(/trigger/i), {
    pointerEventsCheck: 0,
  });
  await userEvent.hover(await findByDisplayValue('6'), {
    pointerEventsCheck: 0,
  });
  expect(await findByText(/lower.+than.+5/i)).toBeInTheDocument();
});
