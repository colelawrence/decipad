import { render } from '@testing-library/react';
import { DashboardPlaceholder } from './DashboardPlaceholder';

it('renders Dashboard with NotebookListPlaceholder', () => {
  const { getByLabelText } = render(<DashboardPlaceholder />);
  expect(getByLabelText('Notebook list loading')).toBeInTheDocument();
});

it('renders Dashboard with DashboardTopbar with loading state', () => {
  const { getByLabelText } = render(<DashboardPlaceholder />);
  expect(getByLabelText('Notebooks loading')).toBeInTheDocument();
});
