import { render } from '@testing-library/react';
import { BodyTrElement } from './BodyTr';

describe('Editor BodyTr Element', () => {
  it('renders the text', () => {
    const { getByText } = render(
      <table>
        <tbody>
          <BodyTrElement>
            <td>BodyTr Element</td>
          </BodyTrElement>
        </tbody>
      </table>
    );

    expect(getByText('BodyTr Element')).toBeVisible();
  });
});
