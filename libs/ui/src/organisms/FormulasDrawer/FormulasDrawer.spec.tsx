import { render } from '@testing-library/react';
import { CodeLine } from '../CodeLine/CodeLine';
import { FormulasDrawer } from './FormulasDrawer';

it('renders children', async () => {
  const { getByText } = render(
    <FormulasDrawer>
      <CodeLine variant="table">42 + 1337</CodeLine>
    </FormulasDrawer>
  );

  expect(getByText('42 + 1337')).toBeVisible();
});
