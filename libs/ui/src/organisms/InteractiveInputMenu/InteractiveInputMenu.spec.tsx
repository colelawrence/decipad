import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentProps } from 'react';
import { InteractiveInputMenu } from './InteractiveInputMenu';

const props: ComponentProps<typeof InteractiveInputMenu> = {
  trigger: <button>trigger</button>,
};

it('renders trigger icon', () => {
  const { getByText } = render(<InteractiveInputMenu {...props} />);
  expect(getByText('trigger')).toBeInTheDocument();
});

it('renders the menu when trigger is clicked', async () => {
  const { findAllByRole, queryAllByRole, findByText } = render(
    <InteractiveInputMenu {...props} />
  );
  expect(queryAllByRole('menuitem')).toHaveLength(0);

  await userEvent.click(await findByText(/trigger/i));

  expect(await findAllByRole('menuitem')).not.toHaveLength(0);
});

describe.each([
  ['onConvert', /turn/i],
  ['onCopy', /copy/i],
  ['onDelete', /delete/i],
])('%s prop', (prop, text) => {
  it('gets called when the respective item is clicked', async () => {
    const testProp = {
      [prop]: jest.fn(),
    };
    const { findByText } = render(
      <InteractiveInputMenu {...props} {...testProp} />
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
