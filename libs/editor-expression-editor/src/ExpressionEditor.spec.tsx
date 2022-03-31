import { Computer } from '@decipad/language';
import { render } from '@testing-library/react';
import { ExpressionEditor } from '.';

describe('ExpressionEditor', () => {
  it('renders number', async () => {
    const { findByText } = render(
      <ExpressionEditor value="123" computer={new Computer()} />
    );
    expect(await findByText('123')).toBeInTheDocument();
  });

  it('renders number and unit separately', async () => {
    const { findByText } = render(
      <ExpressionEditor value="123 bananas" computer={new Computer()} />
    );
    expect(await findByText('123')).toBeInTheDocument();
    expect(await findByText('bananas')).toBeInTheDocument();
  });
});
