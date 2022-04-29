import { render } from '@testing-library/react';
import { TableHeader } from './TableHeader';
import {
  getTypeIcon,
  getDateType,
  getNumberType,
  getStringType,
} from '../../utils';

it('renders the children', () => {
  const { getByText } = render(
    <table>
      <thead>
        <tr>
          <TableHeader>Th Element</TableHeader>
        </tr>
      </thead>
    </table>
  );

  expect(getByText('Th Element')).toBeVisible();
});

describe('Can render typed icons', () => {
  it('renders default type as string', () => {
    const { getByText } = render(
      <table>
        <thead>
          <tr>
            <TableHeader>A string</TableHeader>
          </tr>
        </thead>
      </table>
    );

    expect(getByText('Text')).toBeDefined();
  });

  it('renders type icon', () => {
    const { getByText } = render(
      <table>
        <thead>
          <tr>
            <TableHeader type={getNumberType()}>Th Element</TableHeader>
          </tr>
        </thead>
      </table>
    );

    expect(getByText('Number')).toBeDefined();
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
    const { getByTitle } = render(
      <table>
        <thead>
          <tr>
            <TableHeader type={type}>Th Element</TableHeader>
          </tr>
        </thead>
      </table>
    );

    expect(getByTitle(new RegExp(Icon.name))).toBeInTheDocument();
  });
});
