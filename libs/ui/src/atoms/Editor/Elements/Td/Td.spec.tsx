import { render } from '@testing-library/react';
import { TdElement } from './Td';

describe('Editor Td Element', () => {
  it('renders the text', () => {
    const { getByText } = render(
      <table>
        <tbody>
          <tr>
            <TdElement>Td Element</TdElement>
          </tr>
        </tbody>
      </table>
    );

    expect(getByText('Td Element')).toBeVisible();
  });
});
