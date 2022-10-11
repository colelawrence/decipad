import { StarterChecklistType } from '@decipad/react-contexts';
import { noop } from '@decipad/utils';
import { render } from '@testing-library/react';
import { cloneDeep } from 'lodash';
import { StarterChecklist } from './StarterChecklist';

// The text is just a placeholder, it has no significance.
const testChecklist: StarterChecklistType = {
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
};

it('renders the full checklist menu', () => {
  const { getByText } = render(
    <StarterChecklist onHideChecklist={noop} checklist={testChecklist} />
  );

  expect(getByText(testChecklist.items[0].text)).toBeVisible();
  expect(getByText(testChecklist.items[1].text)).toBeVisible();
  expect(getByText(testChecklist.items[2].text)).toBeVisible();
});

it('shows text NOT crossed out when state is false', () => {
  const { getByText } = render(
    <StarterChecklist onHideChecklist={noop} checklist={testChecklist} />
  );

  expect(getByText(testChecklist.items[0].text)).not.toHaveStyle(
    'text-decoration: line-through;'
  );
  expect(getByText(testChecklist.items[1].text)).not.toHaveStyle(
    'text-decoration: line-through;'
  );
  expect(getByText(testChecklist.items[2].text)).not.toHaveStyle(
    'text-decoration: line-through;'
  );
});

it('shows text crossed out when state is true', () => {
  const crossedChecklist = cloneDeep(testChecklist);
  const widgetExp = crossedChecklist.items.find((i) => i.component === 'exp');
  if (!widgetExp) return;

  widgetExp.state = true;

  const { getByText } = render(
    <StarterChecklist onHideChecklist={noop} checklist={crossedChecklist} />
  );

  expect(getByText(testChecklist.items[0].text)).toHaveStyle(
    'text-decoration: line-through;'
  );
  expect(getByText(testChecklist.items[1].text)).not.toHaveStyle(
    'text-decoration: line-through;'
  );
  expect(getByText(testChecklist.items[2].text)).not.toHaveStyle(
    'text-decoration: line-through;'
  );
});

it('collapses when "Starter Checklist" is clicked', () => {
  const { getByText, queryByText } = render(
    <StarterChecklist onHideChecklist={noop} checklist={testChecklist} />
  );

  getByText('👋 Welcome to Decipad!').click();

  expect(queryByText(testChecklist.items[0].text)).not.toBeInTheDocument();
  expect(queryByText(testChecklist.items[1].text)).not.toBeInTheDocument();
  expect(queryByText(testChecklist.items[2].text)).not.toBeInTheDocument();
});
