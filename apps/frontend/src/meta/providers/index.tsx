import { ToastDisplay } from '@decipad/ui';
import { useSession } from 'next-auth/react';
import { FC, ReactNode } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';
import { AnalyticsProvider } from './AnalyticsProvider';
import { IntercomProvider } from './IntercomProvider';
import { UpdatesHandler } from './UpdatesHandler';

const backendForDND = () =>
  'window' in globalThis && 'ontouchstart' in window
    ? TouchBackend
    : HTML5Backend;

export const Providers: FC<{ children: ReactNode }> = ({ children }) => {
  const session = useSession();

  return (
    <ToastDisplay>
      <UpdatesHandler>
        <QueryParamProvider adapter={ReactRouter6Adapter}>
          <AnalyticsProvider>
            {session.status === 'authenticated' ? (
              <IntercomProvider>
                <DndProvider backend={backendForDND()}>{children}</DndProvider>
              </IntercomProvider>
            ) : (
              <DndProvider backend={backendForDND()}>{children}</DndProvider>
            )}
          </AnalyticsProvider>
        </QueryParamProvider>
      </UpdatesHandler>
    </ToastDisplay>
  );
};
