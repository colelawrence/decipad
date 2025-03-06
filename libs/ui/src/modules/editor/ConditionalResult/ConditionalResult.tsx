import React, { useRef } from 'react';
import { Loading } from 'libs/ui/src/shared';
import { css, keyframes } from '@emotion/react';

// Define the pulse keyframe animation
const pulseKeyframes = keyframes`
  0% { opacity: .66; }
  50% { opacity: 0.15; }
  100% { opacity: .66; }
`;

// Update the pulse style to use the keyframes
const pulseStyle = css({
  animation: `${pulseKeyframes} 1s ease-in-out infinite`,
});

type ConditionalResultProps = {
  kind: 'pending' | 'type-error' | string;
  children: React.ReactNode;
  alwaysRenderedChildren?: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement> &
  React.HTMLAttributes<HTMLSpanElement>;

// A simple Spinner component. In a real app you might have a nicer spinner.

export const ConditionalResult: React.FC<ConditionalResultProps> = ({
  kind,
  children,
  alwaysRenderedChildren,
  ...props
}) => {
  // We use a ref to store the last "good" (i.e. non-loading) children.
  const lastGoodChildrenRef = useRef<React.ReactNode>(null);

  // Determine whether we are in a loading/error state.
  const isLoading = kind === 'pending';

  // If not loading, update the ref with the current children.
  if (!isLoading) {
    lastGoodChildrenRef.current = children;
  }

  // When loading/error:
  // - If we have previously rendered non-loading children, use them in a pulse animation.
  // - Otherwise, show a spinner.
  if (isLoading) {
    if (lastGoodChildrenRef.current) {
      return (
        <div css={pulseStyle} {...props}>
          {lastGoodChildrenRef.current}
          {alwaysRenderedChildren}
        </div>
      );
    }
    return (
      <span {...props}>
        {/* To avoid layout shift, we allocate the same space as the text */}
        <span>&nbsp;</span>
        <Loading style={{ display: 'inline-block' }} width={16} height={16} />
        <span>&nbsp;</span>
        {alwaysRenderedChildren}
      </span>
    );
  }

  // Otherwise, render the children normally.
  return <>{children}</>;
};

export default ConditionalResult;
