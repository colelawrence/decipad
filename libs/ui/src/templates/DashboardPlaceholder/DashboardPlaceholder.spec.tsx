import { render } from '@testing-library/react';
import { FC, PropsWithChildren } from 'react';
import { QueryParamProvider } from 'use-query-params';
import { BrowserRouter } from 'react-router-dom';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';
import { DashboardPlaceholder } from './DashboardPlaceholder';

const WithProviders: FC<PropsWithChildren> = ({ children }) => (
  <BrowserRouter>
    <QueryParamProvider adapter={ReactRouter6Adapter}>
      {children}
    </QueryParamProvider>
  </BrowserRouter>
);

it('renders Dashboard with NotebookListPlaceholder', () => {
  const { getByLabelText } = render(
    <WithProviders>
      <DashboardPlaceholder />
    </WithProviders>
  );
  expect(getByLabelText('Notebook list loading')).toBeInTheDocument();
});

it('renders Dashboard with DashboardTopbar with loading state', () => {
  const { getByLabelText } = render(
    <WithProviders>
      <DashboardPlaceholder />
    </WithProviders>
  );
  expect(getByLabelText('Notebook list loading')).toBeInTheDocument();
});
