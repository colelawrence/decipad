import { GlobalStyles, ToastDisplay } from '@decipad/ui';
import { GraphqlProvider } from '@decipad/graphql-client';
import { SessionProvider } from 'next-auth/react';
import { FC, ReactNode } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { BrowserRouter } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';
import { AnalyticsProvider } from './AnalyticsProvider';
import { IntercomProvider } from './IntercomProvider';
import { UpdatesHandler } from './UpdatesHandler';

const backendForDND = 'ontouchstart' in window ? TouchBackend : HTML5Backend;

export const Providers: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ToastDisplay>
      <SessionProvider>
        <UpdatesHandler>
          <BrowserRouter>
            <QueryParamProvider adapter={ReactRouter6Adapter}>
              <GraphqlProvider>
                <AnalyticsProvider>
                  <IntercomProvider>
                    <DndProvider backend={backendForDND}>
                      <GlobalStyles>{children}</GlobalStyles>
                    </DndProvider>
                  </IntercomProvider>
                </AnalyticsProvider>
              </GraphqlProvider>
            </QueryParamProvider>
          </BrowserRouter>
        </UpdatesHandler>
      </SessionProvider>
    </ToastDisplay>
  );
};
