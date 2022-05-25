import { applyCssVars, findParentWithStyle } from '@decipad/dom-test-utils';
import { mockConsoleWarn } from '@decipad/testutils';
import { noop } from '@decipad/utils';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryHistory, History } from 'history';
import { ComponentProps } from 'react';
import { MemoryRouter, Router } from 'react-router-dom';
import { NavigationItem } from './NavigationItem';

type ExpectedHistory = ComponentProps<typeof Router>['history'];

it('renders the children', () => {
  render(<NavigationItem onClick={noop}>Text</NavigationItem>);
  expect(screen.getByText('Text')).toBeVisible();
});

it('can render a button and emit click events', async () => {
  const handleClick = jest.fn();
  render(<NavigationItem onClick={handleClick}>Text</NavigationItem>);

  await userEvent.click(screen.getByRole('button'));
  expect(handleClick).toHaveBeenCalled();
});
it('can render a link with an href', () => {
  render(<NavigationItem href="/">Text</NavigationItem>);
  expect(screen.getByRole('link')).toHaveAttribute('href', '/');
});

it('renders an optional icon', () => {
  render(
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
  );
  expect(screen.getByTitle('Pretty Icon')).toBeInTheDocument();
});

describe('with a router', () => {
  mockConsoleWarn();

  let cleanup: undefined | (() => void);
  afterEach(() => cleanup?.());

  it('shows when it is active', async () => {
    render(
      <MemoryRouter>
        <NavigationItem href="/page">Text</NavigationItem>
      </MemoryRouter>
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
    it('is not considered active on sub-routes', async () => {
      const history: History = createMemoryHistory({
        initialEntries: ['/page'],
      });
      render(
        <Router history={history as unknown as ExpectedHistory}>
          <NavigationItem exact href="/page">
            Text
          </NavigationItem>
        </Router>
      );
      cleanup = await applyCssVars();
      const activeBackgroundColor = findParentWithStyle(
        screen.getByText('Text'),
        'backgroundColor'
      )?.backgroundColor;
      cleanup();

      history.push('/page/child');
      cleanup = await applyCssVars();
      const childBackgroundColor = findParentWithStyle(
        screen.getByText('Text'),
        'backgroundColor'
      )?.backgroundColor;

      expect(childBackgroundColor).not.toEqual(activeBackgroundColor);
    });
  });
});
