import { StarterChecklistType } from '@decipad/react-contexts';
import { noop, timeout } from '@decipad/utils';
import { act, render } from '@testing-library/react';
import { StarterChecklist } from './StarterChecklist';

// The text is just a placeholder, it has no significance.
const testChecklist = (): StarterChecklistType => ({
  items: [
    {
      component: 'exp',
      text: 'Create your first calculation',
      state: false,
      type: 'interaction',
    },
    {
      component: 'p',
      text: 'Edit the calculation',
      state: false,
      type: 'creation',
    },
    {
      component: 'code_line',
      text: 'Share this notebook',
      state: false,
      type: 'creation',
    },
  ],
  hidden: false,
  confettiUsed: false,
  onStateChange: () => {},
});

it('renders the full checklist menu', () => {
  const cl = testChecklist();
  const { getByText } = render(
    <StarterChecklist onHideChecklist={noop} checklist={cl} />
  );

  expect(getByText(cl.items[0].text)).toBeVisible();
  expect(getByText(cl.items[1].text)).toBeVisible();
  expect(getByText(cl.items[2].text)).toBeVisible();
});

it('shows text NOT crossed out when state is false', () => {
  const cl = testChecklist();
  const { getByText } = render(
    <StarterChecklist onHideChecklist={noop} checklist={cl} />
  );

  expect(getByText(cl.items[0].text)).not.toHaveStyle(
    'text-decoration: line-through;'
  );
  expect(getByText(cl.items[1].text)).not.toHaveStyle(
    'text-decoration: line-through;'
  );
  expect(getByText(cl.items[2].text)).not.toHaveStyle(
    'text-decoration: line-through;'
  );
});

it('shows text crossed out when state is true', () => {
  const crossedChecklist = testChecklist();
  const widgetExp = crossedChecklist.items.find((i) => i.component === 'exp');
  if (!widgetExp) return;

  widgetExp.state = true;

  const { getByText } = render(
    <StarterChecklist onHideChecklist={noop} checklist={crossedChecklist} />
  );

  expect(getByText(crossedChecklist.items[0].text)).toHaveStyle(
    'text-decoration: line-through;'
  );
  expect(getByText(crossedChecklist.items[1].text)).not.toHaveStyle(
    'text-decoration: line-through;'
  );
  expect(getByText(crossedChecklist.items[2].text)).not.toHaveStyle(
    'text-decoration: line-through;'
  );
});

it('collapses when "Starter Checklist" is clicked', async () => {
  const cl = testChecklist();
  const { getByText, queryByText } = render(
    <StarterChecklist onHideChecklist={noop} checklist={cl} />
  );

  await act(async () => {
    getByText('👋 Welcome to Decipad!').click();
    await timeout(1000);
  });

  expect(queryByText(cl.items[0].text)).not.toBeInTheDocument();
  expect(queryByText(cl.items[1].text)).not.toBeInTheDocument();
  expect(queryByText(cl.items[2].text)).not.toBeInTheDocument();
});
