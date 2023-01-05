import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentProps, FC, PropsWithChildren } from 'react';
import { QueryParamProvider } from 'use-query-params';
import { BrowserRouter } from 'react-router-dom';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';
import { DashboardTopbar } from './DashboardTopbar';

const props: ComponentProps<typeof DashboardTopbar> = {};

const WithProviders: FC<PropsWithChildren> = ({ children }) => (
  <BrowserRouter>
    <QueryParamProvider adapter={ReactRouter6Adapter}>
      {children}
    </QueryParamProvider>
  </BrowserRouter>
);

it.skip('renders a level 1 notebook list header', () => {
  const { getByText } = render(
    <WithProviders>
      <DashboardTopbar {...props} />
    </WithProviders>
  );
  expect(getByText(/notebooks/i).tagName).toBe('H1');
});

it('renders a button to create a new notebook', async () => {
  const handleCreateNotebook = jest.fn();
  const { getByText } = render(
    <WithProviders>
      <DashboardTopbar {...props} onCreateNotebook={handleCreateNotebook} />
    </WithProviders>
  );

  await userEvent.click(getByText(/new.+notebook/i));
  expect(handleCreateNotebook).toHaveBeenCalled();
});
