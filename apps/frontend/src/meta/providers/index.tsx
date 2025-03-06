import { ToastDisplay } from '@decipad/ui';
import { useSession } from 'next-auth/react';
import { useMemo, type FC, type ReactNode } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';
import { IntercomProvider } from './IntercomProvider';
import { UpdatesHandler } from './UpdatesHandler';
import { ResourceUsageProvider } from '@decipad/react-contexts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const backendForDND = () =>
  'window' in globalThis && 'ontouchstart' in window
    ? TouchBackend
    : HTML5Backend;

export const Providers: FC<{ children: ReactNode }> = ({ children }) => {
  const session = useSession();
  const queryClient = useMemo(() => new QueryClient(), []);
  return (
    <QueryClientProvider client={queryClient}>
      <ToastDisplay>
        <UpdatesHandler>
          <QueryParamProvider adapter={ReactRouter6Adapter}>
            <ResourceUsageProvider>
              {session.status !== 'unauthenticated' ? (
                <IntercomProvider>
                  <DndProvider backend={backendForDND()}>
                    {children}
                  </DndProvider>
                </IntercomProvider>
              ) : (
                <DndProvider backend={backendForDND()}>{children}</DndProvider>
              )}
            </ResourceUsageProvider>
          </QueryParamProvider>
        </UpdatesHandler>
      </ToastDisplay>
    </QueryClientProvider>
  );
};
