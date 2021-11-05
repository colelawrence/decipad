import { render } from '@testing-library/react';
import { ComponentProps } from 'react';
import { ThElement } from './Th';

const props: ComponentProps<typeof ThElement> = {
  children: 'Text',
  type: 'string',
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

it('renders the trigger for the dropdown menu', () => {
  const { getByTitle } = render(
    <table>
      <thead>
        <tr>
          <ThElement {...props}>Th Element</ThElement>
        </tr>
      </thead>
    </table>
  );

  expect(getByTitle(/caret down/i)).toBeInTheDocument();
});
