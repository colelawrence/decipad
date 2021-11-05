import { render } from '@testing-library/react';

import { MenuList } from '../../molecules';
import { TriggerMenuItem } from './TriggerMenuItem';

// TriggerMenuItem must be created instantiated inside a nested menu
const renderMenu = (children: React.ReactNode) =>
  render(
    <MenuList defaultOpen trigger={<span></span>}>
      <MenuList defaultOpen trigger={children}></MenuList>
    </MenuList>
  );

it('renders the children', () => {
  const { getByText } = renderMenu(<TriggerMenuItem>Text</TriggerMenuItem>);
  expect(getByText('Text')).toBeInTheDocument();
});

it('renders the right caret icon', () => {
  const { getByTitle } = renderMenu(<TriggerMenuItem>Text</TriggerMenuItem>);
  expect(getByTitle(/caret right/i)).toBeInTheDocument();
});

it('renders an optional icon', () => {
  const { getByTitle } = renderMenu(
    <TriggerMenuItem
      icon={
        <svg>
          <title>Pretty Icon</title>
        </svg>
      }
    >
      Text
    </TriggerMenuItem>
  );
  expect(getByTitle('Pretty Icon')).toBeInTheDocument();
});
