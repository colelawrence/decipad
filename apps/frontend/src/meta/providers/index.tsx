import { GlobalStyles, ToastDisplay } from '@decipad/ui';
import { SessionProvider } from 'next-auth/react';
import { FC, ReactNode } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { BrowserRouter } from 'react-router-dom';

import { AnalyticsProvider } from './AnalyticsProvider';
import { FeedbackProvider } from './FeedbackProvider';
import { GraphqlProvider } from './GraphqlProvider';

const backendForDND = 'ontouchstart' in window ? TouchBackend : HTML5Backend;

export const Providers: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <SessionProvider>
      <BrowserRouter>
        <GraphqlProvider>
          <AnalyticsProvider>
            <FeedbackProvider>
              <DndProvider backend={backendForDND}>
                <ToastDisplay>
                  <GlobalStyles>{children}</GlobalStyles>
                </ToastDisplay>
              </DndProvider>
            </FeedbackProvider>
          </AnalyticsProvider>
        </GraphqlProvider>
      </BrowserRouter>
    </SessionProvider>
  );
};
