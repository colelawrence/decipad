import { render, screen } from '@testing-library/react';
import { FunctionComponent } from 'react';
import {
  getDateType,
  getNumberType,
  getStringType,
  getTypeIcon,
} from '../../utils';
import { TableHeader } from './TableHeader';

it('renders the children', () => {
  render(
    <table>
      <thead>
        <tr>
          <TableHeader>Th Element</TableHeader>
        </tr>
      </thead>
    </table>
  );

  expect(screen.getByText('Th Element')).toBeVisible();
});

describe('Can render typed icons', () => {
  it('renders default type as string', () => {
    render(
      <table>
        <thead>
          <tr>
            <TableHeader>A string</TableHeader>
          </tr>
        </thead>
      </table>
    );

    expect(screen.getByText('Text')).toBeDefined();
  });

  it('renders type icon', () => {
    render(
      <table>
        <thead>
          <tr>
            <TableHeader type={getNumberType()}>Th Element</TableHeader>
          </tr>
        </thead>
      </table>
    );

    expect(screen.getByText('Number')).toBeDefined();
  });
});

describe('type prop', () => {
  it.each([
    ['date day', getDateType('day'), getTypeIcon(getDateType('day'))],
    ['date month', getDateType('month'), getTypeIcon(getDateType('month'))],
    ['date year', getDateType('year'), getTypeIcon(getDateType('year'))],
    ['date time', getDateType('minute'), getTypeIcon(getDateType('minute'))],
    ['number', getNumberType(), getTypeIcon(getNumberType())],
    ['string', getStringType(), getTypeIcon(getStringType())],
  ])('renders icon for type %s', (_, type, Icon) => {
    render(
      <table>
        <thead>
          <tr>
            <TableHeader type={type}>Th Element</TableHeader>
          </tr>
        </thead>
      </table>
    );

    expect(
      screen.getByTitle(new RegExp((Icon as FunctionComponent).name))
    ).toBeInTheDocument();
  });
});
