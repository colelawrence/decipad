import { ComponentProps, ReactNode, Suspense } from 'react';
import { Titled } from 'react-titled';
import { ErrorBoundary } from './ErrorBoundary';

type FrameProps = {
  readonly title: string | null; // explicit null, omitting prop not allowed to make sure title is not forgotten when adding a page
  readonly children: ReactNode;
  readonly suspenseFallback: ReactNode;
} & ComponentProps<typeof ErrorBoundary>;

export const Frame: React.FC<FrameProps> = ({
  children,
  title,
  suspenseFallback,
  ...props
}) => (
  <ErrorBoundary {...props}>
    <Titled
      title={(parentTitle) =>
        title
          ? parentTitle
            ? `${title} — ${parentTitle}`
            : title
          : parentTitle
      }
    >
      <Suspense fallback={suspenseFallback}>{children}</Suspense>
    </Titled>
  </ErrorBoundary>
);
