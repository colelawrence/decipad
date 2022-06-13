import { FC, ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { SessionProvider } from 'next-auth/react';
import { GlobalStyles, ToastDisplay } from '@decipad/ui';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { GraphqlProvider } from './GraphqlProvider';
import { AnalyticsProvider } from './AnalyticsProvider';
import { FeedbackProvider } from './FeedbackProvider';

export const Providers: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <SessionProvider>
      <BrowserRouter>
        <GraphqlProvider>
          <AnalyticsProvider>
            <FeedbackProvider>
              <DndProvider backend={HTML5Backend}>
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
