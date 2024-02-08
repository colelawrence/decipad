import { FC, PropsWithChildren } from 'react';
import { noop } from '@decipad/utils';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { NavigationItem } from './NavigationItem';

const WithProviders: FC<PropsWithChildren> = ({ children }) => (
  <DndProvider backend={HTML5Backend}>{children}</DndProvider>
);

it('renders the children', () => {
  render(
    <WithProviders>
      <NavigationItem onClick={noop}>Text</NavigationItem>
    </WithProviders>
  );
  expect(screen.getByText('Text')).toBeVisible();
});

it('can render a button and emit click events', async () => {
  const handleClick = jest.fn();
  render(
    <WithProviders>
      <NavigationItem onClick={handleClick}>Text</NavigationItem>
    </WithProviders>
  );

  await userEvent.click(screen.getByRole('button'));
  expect(handleClick).toHaveBeenCalled();
});
it('can render a link with an href', () => {
  render(
    <WithProviders>
      <NavigationItem href="/">Text</NavigationItem>
    </WithProviders>
  );
  expect(screen.getByRole('link')).toHaveAttribute('href', '/');
});
