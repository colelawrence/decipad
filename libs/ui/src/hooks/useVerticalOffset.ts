import { useState, useEffect, RefObject } from 'react';
import { OVERFLOWING_EDITOR_ID } from '../constants';

const PADDING_TOP = 200;

export const useVerticalOffset = (
  blockRef: RefObject<HTMLElement>
): number | undefined => {
  const [offset, setOffset] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (blockRef.current == null) {
      throw new Error('BlockRef provided cannot point to a null element');
    }

    const wrapperElement = document.getElementById(OVERFLOWING_EDITOR_ID)!;
    const element = blockRef.current!;

    const blockObserver = new MutationObserver(() => {
      setOffset(element.offsetTop);
    });

    blockObserver.observe(wrapperElement, {
      attributes: true,
      childList: true,
      subtree: true,
    });

    setOffset(element.offsetTop);

    return () => {
      blockObserver.disconnect();
    };
  }, [blockRef]);

  if (offset == null) {
    return undefined;
  }

  return offset + PADDING_TOP;
};
