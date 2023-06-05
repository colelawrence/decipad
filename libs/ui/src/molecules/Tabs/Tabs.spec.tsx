import { render, screen } from '@testing-library/react';
import { Tabs } from './Tabs';

it('renders a table data', () => {
  render(
    <Tabs>
      <p>Table Data</p>
    </Tabs>
  );

  expect(screen.getByText('Table Data')).toBeVisible();
});
