import { render } from '@testing-library/react';
import { SmartCell } from './SmartCell';

it('renders', () => {
  const { getByText } = render(
    <table>
      <tbody>
        <tr>
          <SmartCell aggregationType="aggtype" />
        </tr>
      </tbody>
    </table>
  );

  expect(getByText(/aggtype/i)).toBeInTheDocument();
});
