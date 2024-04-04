import type { ComponentProps, ReactNode } from 'react';
import { Suspense } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';
import { ErrorBoundary } from './ErrorBoundary';

type FrameProps = {
  readonly title: string | null; // explicit null, omitting prop not allowed to make sure title is not forgotten when adding a page
  readonly children: ReactNode;
  readonly suspenseFallback: ReactNode;
  readonly Heading: 'h1';
} & ComponentProps<typeof ErrorBoundary>;

export const Frame: React.FC<FrameProps> = ({
  children,
  title,
  suspenseFallback,
  ...props
}) => {
  const location = useLocation();
  const pageTitle = title ? `${title} | Decipad` : null;

  return (
    <ErrorBoundary {...props}>
      {pageTitle && (
        <Helmet title={pageTitle}>
          <meta property="og:title" content={pageTitle} />
          <meta
            property="og:url"
            content={`https://app.decipad.com${location.pathname}`}
          />
        </Helmet>
      )}
      <Suspense fallback={suspenseFallback}>{children}</Suspense>
    </ErrorBoundary>
  );
};
