import { createPortal } from 'react-dom';
import type { PropsWithChildren } from 'react';
import { useEffect, useRef, useState } from 'react';
import { noop } from 'lodash';
import { useWindowListener, useCanUseDom } from '@decipad/react-utils';
import type { ShadowCalcPortal } from '@decipad/react-contexts';
import { CodeLineFloat, CodeLinePlaceholder } from '@decipad/ui';
import { BlockErrorBoundary } from '../BlockErrorBoundary';

export const DISMISS_KEYS = ['Escape', 'Enter'];

/**
 * Moves code line to an active number for editing
 */
export const CodeLineTeleport: React.FC<
  PropsWithChildren<{
    codeLine?: ShadowCalcPortal;
    onDismiss?(_key?: string): void;
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

  const canUseDom = useCanUseDom();

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
      {canUseDom && createPortal(editable, portal)}
    </>
  );
};
