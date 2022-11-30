import { createPortal } from 'react-dom';
import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { noop } from 'lodash';
import { useDelayedTrue, useWindowListener } from '@decipad/react-utils';
import { ShadowCalcPortal } from '@decipad/react-contexts';
import { CodeLinePlaceholder, CodeLineFloat } from '@decipad/ui';

const DISMISS_KEYS = ['Escape', 'Enter'];

/**
 * Moves code line to an active number for editing
 */
export const CodeLineTeleport: React.FC<
  PropsWithChildren<{
    codeLine?: ShadowCalcPortal;
    onBlur?(): void;
    onTeleport?(): void;
  }>
> = ({ codeLine, children, onBlur = noop, onTeleport = noop }) => {
  const portal = codeLine?.element;
  const isVisible = codeLine != null && portal != null;

  // TODO: ENG-1398 It maybe better to use overlay behind teleport element
  const shouldLock = useDelayedTrue(isVisible, 100);

  useLockInteractions(shouldLock, onBlur);

  const teleportRef = useRef<typeof onTeleport>(null);

  // eslint-disable-next-line no-param-reassign
  // @ts-ignore
  teleportRef.current = onTeleport;

  useEffect(() => {
    if (isVisible) {
      teleportRef.current?.();
    }
  }, [isVisible, teleportRef]);

  useWindowListener('keydown', (event) => {
    if (DISMISS_KEYS.includes(event.key)) {
      event.stopPropagation();
      event.preventDefault();
      onBlur();
    }
  });

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
    <CodeLineFloat offsetTop={codeLine.offsetY}>{children}</CodeLineFloat>
  );

  return (
    <>
      <CodeLinePlaceholder height={contentHeight} />
      {createPortal(editable, portal)}
    </>
  );
};

// FIXME: ENG-1398
const useLockInteractions = (lock: boolean, onBlur: () => void) => {
  useEffect(() => {
    if (!lock) return noop;

    const root = document.getElementById('root');
    if (!root) return noop;

    root.style.pointerEvents = 'none';
    document.body.addEventListener('click', onBlur);

    return () => {
      root.style.removeProperty('pointer-events');
      document.body.removeEventListener('click', onBlur);
    };
  }, [lock, onBlur]);
};
