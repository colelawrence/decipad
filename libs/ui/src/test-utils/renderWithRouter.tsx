import { render, RenderOptions } from '@testing-library/react';
import { PropsWithChildren } from 'react';
import { MemoryRouter } from 'react-router-dom';

const AllTheProviders = ({ children }: PropsWithChildren) => {
  return <MemoryRouter>{children}</MemoryRouter>;
};

export const renderWithRouter = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'queries'>
) => render(ui, { wrapper: AllTheProviders, ...options });
