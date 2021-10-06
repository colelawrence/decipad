import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentProps } from 'react';
import { ThElement } from './Th';

const props: ComponentProps<typeof ThElement> = {
  children: 'Text',
  attributes: {
    'data-slate-leaf': true,
    'data-slate-node': 'element',
  },
  leaf: { text: '' },
  text: { text: '' },
  nodeProps: { styles: { root: { css: null } } },
};

it('renders the children', () => {
  const { getByText } = render(
    <table>
      <thead>
        <tr>
          <ThElement {...props}>Th Element</ThElement>
        </tr>
      </thead>
    </table>
  );

  expect(getByText('Th Element')).toBeVisible();
});

it('opens and closes the menu', () => {
  const { getByText, queryByText, getByTitle } = render(
    <table>
      <thead>
        <tr>
          <ThElement {...props}>Th Element</ThElement>
        </tr>
      </thead>
    </table>
  );

  userEvent.click(getByTitle(/arrow down/i));
  expect(getByText(/type/i, { selector: 'li button' })).toBeVisible();

  userEvent.click(getByTitle(/arrow down/i));
  expect(
    queryByText(/type/i, { selector: 'li button' })
  ).not.toBeInTheDocument();
});

it('closes the menu when you change the type', () => {
  const { queryByText, getByTitle } = render(
    <table>
      <thead>
        <tr>
          <ThElement {...props}>Th Element</ThElement>
        </tr>
      </thead>
    </table>
  );

  userEvent.click(getByTitle(/arrow down/i));
  userEvent.click(getByTitle(/type/i));
  userEvent.click(getByTitle(/number/i));
  expect(
    queryByText(/type/i, { selector: 'li button' })
  ).not.toBeInTheDocument();
});
