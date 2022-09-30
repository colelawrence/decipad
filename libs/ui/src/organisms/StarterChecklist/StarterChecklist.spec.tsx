import { StarterChecklistType } from '@decipad/react-contexts';
import { noop } from '@decipad/utils';
import { render } from '@testing-library/react';
import { cloneDeep } from 'lodash';
import { StarterChecklist } from './StarterChecklist';

const testChecklist: StarterChecklistType = {
  items: [
    {
      id: 1,
      component: 'exp',
      text: 'Widget text',
      state: false,
      type: 'interaction',
    },
    {
      id: 2,
      component: 'p',
      text: 'Paragraph text',
      state: false,
      type: 'creation',
    },
    {
      id: 3,
      component: 'code_line',
      text: 'Codeline text',
      state: false,
      type: 'creation',
    },
  ],
  hidden: false,
  completed: false,
};

it('renders the full checklist menu', () => {
  const { getByText } = render(
    <StarterChecklist onHideChecklist={noop} checklist={testChecklist} />
  );

  expect(getByText('Widget text')).toBeVisible();
  expect(getByText('Paragraph text')).toBeVisible();
  expect(getByText('Codeline text')).toBeVisible();
});

it('shows text NOT crossed out when state is false', () => {
  const { getByText } = render(
    <StarterChecklist onHideChecklist={noop} checklist={testChecklist} />
  );

  expect(getByText('Widget text')).not.toHaveStyle(
    'text-decoration: line-through;'
  );
  expect(getByText('Paragraph text')).not.toHaveStyle(
    'text-decoration: line-through;'
  );
  expect(getByText('Codeline text')).not.toHaveStyle(
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

  expect(getByText('Widget text')).toHaveStyle(
    'text-decoration: line-through;'
  );
  expect(getByText('Paragraph text')).not.toHaveStyle(
    'text-decoration: line-through;'
  );
  expect(getByText('Codeline text')).not.toHaveStyle(
    'text-decoration: line-through;'
  );
});

it('collapses when "Starter Checklist" is clicked', () => {
  const { getByText, queryByText } = render(
    <StarterChecklist onHideChecklist={noop} checklist={testChecklist} />
  );

  getByText('👋 Welcome to Decipad!').click();

  expect(queryByText('Widget text')).not.toBeInTheDocument();
  expect(queryByText('Paragraph text')).not.toBeInTheDocument();
  expect(queryByText('Codeline text')).not.toBeInTheDocument();
});
