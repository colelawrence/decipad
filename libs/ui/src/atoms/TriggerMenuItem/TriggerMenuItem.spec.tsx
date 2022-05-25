import { render, screen } from '@testing-library/react';
import { FC } from 'react';
import { MenuWrapper } from '../../test-utils';
import { TriggerMenuItem } from './TriggerMenuItem';

// TriggerMenuItem must be created instantiated inside a nested menu
const wrapper: FC<React.PropsWithChildren<unknown>> = ({ children }) => (
  <MenuWrapper>
    <MenuWrapper>{children}</MenuWrapper>
  </MenuWrapper>
);

it('renders the children', () => {
  render(<TriggerMenuItem>Text</TriggerMenuItem>, {
    wrapper,
  });
  expect(screen.getByText('Text')).toBeInTheDocument();
});

it('renders the right caret icon', () => {
  render(<TriggerMenuItem>Text</TriggerMenuItem>, {
    wrapper,
  });
  expect(screen.getByTitle(/caret right/i)).toBeInTheDocument();
});

it('renders an optional icon', () => {
  render(
    <TriggerMenuItem
      icon={
        <svg>
          <title>Pretty Icon</title>
        </svg>
      }
    >
      Text
    </TriggerMenuItem>,
    { wrapper }
  );
  expect(screen.getByTitle('Pretty Icon')).toBeInTheDocument();
});
