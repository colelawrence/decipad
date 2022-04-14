import { ComponentProps } from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryHistory, History } from 'history';
import { MemoryRouter, Router } from 'react-router-dom';
import { applyCssVars, findParentWithStyle } from '@decipad/dom-test-utils';
import { mockConsoleWarn } from '@decipad/testutils';
import { noop } from '@decipad/utils';
import { NavigationItem } from './NavigationItem';

type ExpectedHistory = ComponentProps<typeof Router>['history'];

it('renders the children', () => {
  const { getByText } = render(
    <NavigationItem onClick={noop}>Text</NavigationItem>
  );
  expect(getByText('Text')).toBeVisible();
});

it('can render a button and emit click events', async () => {
  const handleClick = jest.fn();
  const { getByRole } = render(
    <NavigationItem onClick={handleClick}>Text</NavigationItem>
  );

  await userEvent.click(getByRole('button'));
  expect(handleClick).toHaveBeenCalled();
});
it('can render a link with an href', () => {
  const { getByRole } = render(<NavigationItem href="/">Text</NavigationItem>);
  expect(getByRole('link')).toHaveAttribute('href', '/');
});

it('renders an optional icon', () => {
  const { getByTitle } = render(
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
  expect(getByTitle('Pretty Icon')).toBeInTheDocument();
});

describe('with a router', () => {
  mockConsoleWarn();

  let cleanup: undefined | (() => void);
  afterEach(() => cleanup?.());

  it('shows when it is active', async () => {
    const { getByText } = render(
      <MemoryRouter>
        <NavigationItem href="/page">Text</NavigationItem>
      </MemoryRouter>
    );
    cleanup = await applyCssVars();
    const normalBackgroundColor = findParentWithStyle(
      getByText('Text'),
      'backgroundColor'
    )?.backgroundColor;
    cleanup();

    await userEvent.click(getByText('Text'));
    cleanup = await applyCssVars();
    const activeBackgroundColor = findParentWithStyle(
      getByText('Text'),
      'backgroundColor'
    )?.backgroundColor;

    expect(activeBackgroundColor).not.toEqual(normalBackgroundColor);
  });

  describe('and the exact prop', () => {
    it('is not considered active on sub-routes', async () => {
      const history: History = createMemoryHistory({
        initialEntries: ['/page'],
      });
      const { getByText } = render(
        <Router history={history as unknown as ExpectedHistory}>
          <NavigationItem exact href="/page">
            Text
          </NavigationItem>
        </Router>
      );
      cleanup = await applyCssVars();
      const activeBackgroundColor = findParentWithStyle(
        getByText('Text'),
        'backgroundColor'
      )?.backgroundColor;
      cleanup();

      history.push('/page/child');
      cleanup = await applyCssVars();
      const childBackgroundColor = findParentWithStyle(
        getByText('Text'),
        'backgroundColor'
      )?.backgroundColor;

      expect(childBackgroundColor).not.toEqual(activeBackgroundColor);
    });
  });
});
