import { render } from '@testing-library/react';
import { FormulaTableData } from './FormulaTableData';

it('renders the text', () => {
  const { getByText } = render(
    <table>
      <tbody>
        <tr>
          <FormulaTableData result="Result from computer">
            Text from document
          </FormulaTableData>
        </tr>
      </tbody>
    </table>
  );

  expect(getByText('Result from computer')).toBeVisible();

  // Formula cells do pass on {children} to avoid a Slate crash,
  // but visually they only show the result from the computer
  expect(getByText('Text from document')).toBeInTheDocument();
  expect(getByText('Text from document')).not.toBeVisible();
});
