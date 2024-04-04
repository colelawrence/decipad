import type { ComponentProps, ReactNode } from 'react';
import React from 'react';
import { LoadingLogo } from '@decipad/ui';
import type { ErrorBoundary } from './ErrorBoundary';
import { Frame } from './Frame';

type FrameProps = {
  readonly title?: string;
  readonly children: ReactNode;
  readonly suspenseFallback?: ReactNode;
} & Omit<ComponentProps<typeof ErrorBoundary>, 'Heading'>;

export const LazyRoute: React.FC<FrameProps> = ({
  title = null,
  suspenseFallback,
  ...props
}) => (
  <Frame
    {...props}
    title={title}
    Heading={'h1'}
    suspenseFallback={suspenseFallback || <LoadingLogo />}
  >
    {props.children}
  </Frame>
);
