import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { mockConsoleError } from '@decipad/testutils';
import { noop } from '@decipad/utils';
import { render, screen } from '@testing-library/react';
import { FC, PropsWithChildren } from 'react';

import { NavigationList } from './NavigationList';
import { NavigationItem } from '../NavigationItem/NavigationItem';

const WithProviders: FC<PropsWithChildren> = ({ children }) => (
  <DndProvider backend={HTML5Backend}>{children}</DndProvider>
);

mockConsoleError();

it('renders a list', () => {
  render(
    <WithProviders>
      <NavigationList>
        <NavigationItem onClick={noop}>Item 1</NavigationItem>
      </NavigationList>
    </WithProviders>
  );
  expect(screen.getByRole('list')).toBeVisible();
});

it('renders each child as a list item', () => {
  render(
    <WithProviders>
      <NavigationList>
        <NavigationItem onClick={noop}>Item 1</NavigationItem>
        {null}
        {undefined}
        <NavigationItem onClick={noop}>Item 2</NavigationItem>
      </NavigationList>
    </WithProviders>
  );
  expect(
    screen.getAllByRole('listitem').map(({ textContent }) => textContent)
  ).toEqual(['Item 1', 'Item 2']);
});
