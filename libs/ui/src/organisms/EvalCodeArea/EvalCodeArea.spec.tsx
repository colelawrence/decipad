import { render } from '@testing-library/react';
import { EvalCodeArea } from './EvalCodeArea';

it('renders children', () => {
  const { getByText } = render(<EvalCodeArea>10</EvalCodeArea>);
  expect(getByText('10')).toBeVisible();
});
