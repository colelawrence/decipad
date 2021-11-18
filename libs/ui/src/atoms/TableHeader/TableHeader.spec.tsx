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

describe('icon prop', () => {
  it('renders icon', () => {
    const { getByText } = render(
      <table>
        <thead>
          <tr>
            <TableHeader icon={<span>icon</span>}>Th Element</TableHeader>
          </tr>
        </thead>
      </table>
    );

    expect(getByText('icon')).toBeVisible();
  });
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
