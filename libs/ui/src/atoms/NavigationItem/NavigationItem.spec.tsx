import { FC, PropsWithChildren } from 'react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { applyCssVars, findParentWithStyle } from '@decipad/dom-test-utils';
import { mockConsoleWarn } from '@decipad/testutils';
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

it('renders an optional icon', () => {
  render(
    <WithProviders>
      <NavigationItem
        onClick={noop}
        icon={
          <svg>
            <title>Pretty Icon</title>
          </svg>
        }
      >
        Text
      </NavigationItem>
    </WithProviders>
  );
  expect(screen.getByTitle('Pretty Icon')).toBeInTheDocument();
});

describe('with a router', () => {
  mockConsoleWarn();

  let cleanup: undefined | (() => void);
  afterEach(() => cleanup?.());

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('shows when it is active', async () => {
    render(
      <WithProviders>
        <MemoryRouter>
          <NavigationItem href="/page">Text</NavigationItem>
        </MemoryRouter>
      </WithProviders>
    );
    cleanup = await applyCssVars();
    const normalBackgroundColor = findParentWithStyle(
      screen.getByText('Text'),
      'backgroundColor'
    )?.backgroundColor;
    cleanup();

    await userEvent.click(screen.getByText('Text'));
    cleanup = await applyCssVars();
    const activeBackgroundColor = findParentWithStyle(
      screen.getByText('Text'),
      'backgroundColor'
    )?.backgroundColor;

    expect(activeBackgroundColor).not.toEqual(normalBackgroundColor);
  });

  describe('and the exact prop', () => {
    // eslint-disable-next-line jest/no-disabled-tests
    it.skip('is not considered active on sub-routes', async () => {
      const NavigateToChild: FC = () => {
        const navigate = useNavigate();
        return <button onClick={() => navigate('child')}>child</button>;
      };
      render(
        <WithProviders>
          <MemoryRouter initialEntries={['/page']}>
            <NavigationItem exact href="/page">
              Text
            </NavigationItem>
            <NavigateToChild />
          </MemoryRouter>
        </WithProviders>
      );
      cleanup = await applyCssVars();
      const activeBackgroundColor = findParentWithStyle(
        screen.getByText('Text'),
        'backgroundColor'
      )?.backgroundColor;
      cleanup();

      await userEvent.click(screen.getByText('child'));
      cleanup = await applyCssVars();
      const childBackgroundColor = findParentWithStyle(
        screen.getByText('Text'),
        'backgroundColor'
      )?.backgroundColor;

      expect(childBackgroundColor).not.toEqual(activeBackgroundColor);
    });
  });
});
