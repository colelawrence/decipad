import { render } from '@testing-library/react';
import { TableHeader, typeIcons } from './TableHeader';

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

describe('type prop', () => {
  it.each(Object.entries(typeIcons))(
    'renders icon for type %s',
    (type, Icon) => {
      const { getByTitle } = render(
        <table>
          <thead>
            <tr>
              <TableHeader type={type as keyof typeof typeIcons}>
                Th Element
              </TableHeader>
            </tr>
          </thead>
        </table>
      );

      expect(getByTitle(new RegExp(Icon.name))).toBeInTheDocument();
    }
  );
});

describe('rightSlot prop', () => {
  it('renders hidden when provided', () => {
    const { getByText } = render(
      <table>
        <thead>
          <tr>
            <TableHeader rightSlot="Right">Th Element</TableHeader>
          </tr>
        </thead>
      </table>
    );

    expect(getByText('Right')).toBeInTheDocument();
    expect(getByText('Right')).not.toBeVisible();
  });
});
