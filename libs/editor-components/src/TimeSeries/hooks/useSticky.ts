import { useEffect, useLayoutEffect, useRef, useState } from 'react';

type ElementRef = React.RefObject<HTMLElement>;

export const useSticky = () => {
  const [isSticky, setIsSticky] = useState({ top: false, left: false });

  const handleScroll = (
    stickyRef: ElementRef,
    scrollRef: ElementRef,
    initialStickyClientRect: DOMRect
  ) => {
    if (!stickyRef.current || !scrollRef.current) return;

    // Get the sticky element's offset and scroll container's scroll position
    const stickyElementStyle = window.getComputedStyle(stickyRef.current);
    const stickyClientRect = stickyRef.current.getBoundingClientRect();

    const stickyTop = stickyRef.current.offsetTop;
    const stickyLeft = stickyRef.current.offsetLeft;

    const stickyElementTop = parseInt(stickyElementStyle.top, 10);
    const stickyElementLeft = parseInt(stickyElementStyle.left, 10);

    const stickyOffsetTop = stickyClientRect.top;
    const stickyOffsetLeft = stickyClientRect.left;

    // Check if the sticky element has stuck for `top` and `left`
    const isTopSticky = stickyOffsetTop <= stickyElementTop;
    const isLeftSticky = stickyOffsetLeft <= stickyElementLeft;

    console.log(
      '🚀 ~ handleScroll ~ stickyOffsetLeft <= stickyElementLeft:',
      initialStickyClientRect.left,
      stickyLeft,
      stickyOffsetLeft - initialStickyClientRect.left,
      '<=',
      stickyElementLeft
    );

    setIsSticky({ top: isTopSticky, left: isLeftSticky });
  };

  const initializeScrollListener = (
    stickyRef: ElementRef,
    scrollRef: ElementRef,
    stickyClientRect: DOMRect
  ) => {
    if (!scrollRef.current) return;

    const onScroll = () => handleScroll(stickyRef, scrollRef, stickyClientRect);

    scrollRef.current.addEventListener('scroll', onScroll);

    return () => {
      scrollRef.current?.removeEventListener('scroll', onScroll);
    };
  };

  const useStickyWithRefs = (stickyRef: ElementRef, scrollRef: ElementRef) => {
    useLayoutEffect(() => {});

    useEffect(() => {
      if (!stickyRef.current || !scrollRef.current) return;

      const stickyClientRect = stickyRef.current.getBoundingClientRect();

      return initializeScrollListener(stickyRef, scrollRef, stickyClientRect);
    }, [stickyRef, scrollRef]);
  };

  return { isSticky, useStickyWithRefs };
};
