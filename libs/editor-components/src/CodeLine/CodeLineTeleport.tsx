import { ShadowCalcPortal } from '@decipad/react-contexts';
import { useWindowListener } from '@decipad/react-utils';
import { CodeLineFloat, CodeLinePlaceholder } from '@decipad/ui';
import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { noop } from '@decipad/utils';
import { BlockErrorBoundary } from '../BlockErrorBoundary';

export const DISMISS_KEYS = ['Escape', 'Enter'];

/**
 * Moves code line to an active number for editing
 */
export const CodeLineTeleport: React.FC<
  PropsWithChildren<{
    codeLine?: ShadowCalcPortal;
    onDismiss?(key?: string): void;
    onTeleport?(): void;
    onBringBack?(): void;
  }>
> = ({
  codeLine,
  children,
  onDismiss = noop,
  onTeleport = noop,
  onBringBack = noop,
}) => {
  const portal = codeLine?.element;
  const isVisible = codeLine != null && portal != null;

  const teleportRef = useRef<typeof onTeleport>(null);

  // eslint-disable-next-line no-param-reassign
  // @ts-ignore
  teleportRef.current = onTeleport;

  useEffect(() => {
    if (isVisible) {
      teleportRef.current?.();
    }
  }, [isVisible, teleportRef]);

  useWindowListener(
    'keydown',
    (event) => {
      if (isVisible && DISMISS_KEYS.includes(event.key)) {
        event.stopPropagation();
        event.preventDefault();
        onDismiss(event.key);
      }
    },
    true
  );

  const [contentHeight, setContentHeight] = useState(0);
  const codeLineRef = useRef<HTMLSpanElement>(null);
  const currentHeight = codeLineRef.current?.offsetHeight || 0;

  useEffect(() => {
    if (isVisible) return;
    if (currentHeight === 0) return;

    setContentHeight(currentHeight);
  }, [isVisible, currentHeight, setContentHeight]);

  if (!isVisible) {
    return <span ref={codeLineRef}>{children}</span>;
  }

  const editable = (
    <BlockErrorBoundary>
      <CodeLineFloat offsetTop={codeLine.offsetY}>{children}</CodeLineFloat>
    </BlockErrorBoundary>
  );

  return (
    <>
      <CodeLinePlaceholder height={contentHeight} onBringBack={onBringBack} />
      {createPortal(editable, portal)}
    </>
  );
};
