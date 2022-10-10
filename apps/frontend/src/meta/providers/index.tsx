import { GlobalStyles, ToastDisplay } from '@decipad/ui';
import { SessionProvider } from 'next-auth/react';
import { FC, ReactNode } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { BrowserRouter } from 'react-router-dom';

import { AnalyticsProvider } from './AnalyticsProvider';
import { FeedbackProvider } from './FeedbackProvider';
import { IntercomProvider } from './IntercomProvider';
import { GraphqlProvider } from './GraphqlProvider';
import { UpdatesHandler } from './UpdatesHandler';

const backendForDND = 'ontouchstart' in window ? TouchBackend : HTML5Backend;

export const Providers: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <SessionProvider>
      <BrowserRouter>
        <GraphqlProvider>
          <AnalyticsProvider>
            <FeedbackProvider>
              <IntercomProvider>
                <DndProvider backend={backendForDND}>
                  <ToastDisplay>
                    <GlobalStyles>{children}</GlobalStyles>
                    <UpdatesHandler />
                  </ToastDisplay>
                </DndProvider>
              </IntercomProvider>
            </FeedbackProvider>
          </AnalyticsProvider>
        </GraphqlProvider>
      </BrowserRouter>
    </SessionProvider>
  );
};
