import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ToastItem } from '@decipad/ui';

import * as ToastPrimitive from '@radix-ui/react-toast';

import { ToastContext, ToastContextImpl, ToastType } from '@decipad/toast';
import { css } from '@emotion/react';
import { isServerSideRendering } from '@decipad/support';

const ANIMATION_OUT_DURATION = 150;

const viewportStyles = css({
  position: 'fixed',
  top: 0,
  left: '50%',
  transform: 'translateX(-50%)',
  minWidth: '320px',
  maxWidth: '100vw',
  margin: 0,
  listStyle: 'none',
  outline: 'none',
  transition: 'transform 150ms ease-out',
  zIndex: 9999,
});

type ToastDisplayProps = {
  children: React.ReactNode;
};

export const ToastDisplay: React.FC<ToastDisplayProps> = ({
  children,
  ...props
}) => {
  const [show] = useState(!isServerSideRendering());

  const [toasts, setToasts] = useState<Map<string, ToastType>>(new Map());

  const toastElementsMapRef = useRef<Map<string, HTMLLIElement>>(new Map());

  const viewportRef = useRef<HTMLOListElement>(null);

  const sortToasts = useCallback(() => {
    const toastElements = Array.from(toastElementsMapRef.current).reverse();
    const heights: number[] = [];

    toastElements.forEach(([, toast], index) => {
      if (!toast) return;
      const height = toast.clientHeight;
      heights.push(height);
      const frontToastHeight = heights[0];
      toast.setAttribute('data-front', (index === 0).toString());
      toast.setAttribute('data-hidden', (index > 2).toString());

      toast.style.setProperty('--index', index.toString());
      toast.style.setProperty('--height', `${height}px`);
      toast.style.setProperty('--front-height', `${frontToastHeight}px`);
      const hoverOffsetY = heights.slice(0, index).reduce((res, next) => {
        const offset = res + next;
        return offset;
      }, 0);
      toast.style.setProperty('--hover-offset-y', `${hoverOffsetY}px`);
    });
  }, []);

  const handleAddToast = useCallback(
    (
      toast: Omit<
        Omit<ToastType, 'options'> & Partial<Pick<ToastType, 'options'>>,
        'open'
      >
    ) => {
      const toastId = String(Date.now());
      setToasts((currentToasts) => {
        const newMap = new Map(currentToasts);
        const { options } = toast;
        newMap.set(toastId, {
          ...toast,
          open: true,
          options: {
            duration: options?.duration ?? 6000,
            autoDismiss: options?.autoDismiss ?? true,
          },
        });
        return newMap;
      });
      return toastId;
    },
    []
  );

  const handleRemoveToast = useCallback((key: string) => {
    setToasts((currentToasts) => {
      const newMap = new Map(currentToasts);
      newMap.delete(key);
      return newMap;
    });
  }, []);

  const handleDispatch = useCallback(
    (
      content: ToastType['content'],
      status: ToastType['status'],
      options?: ToastType['options'] | undefined
    ) => handleAddToast({ status, content, options }),
    [handleAddToast]
  );

  const handleDispatchSuccess = useCallback(
    (content: ToastType['content'], options?: ToastType['options']) =>
      handleDispatch(content, 'success', options),
    [handleDispatch]
  );

  const handleDispatchError = useCallback(
    (content: ToastType['content'], options?: ToastType['options']) =>
      handleDispatch(content, 'error', options),
    [handleDispatch]
  );

  const handleDispatchWarning = useCallback(
    (content: ToastType['content'], options?: ToastType['options']) =>
      handleDispatch(content, 'warning', options),
    [handleDispatch]
  );

  const handleDispatchInfo = useCallback(
    (content: ToastType['content'], options?: ToastType['options']) =>
      handleDispatch(content, 'info', options),
    [handleDispatch]
  );

  useEffect(() => {
    const viewport = viewportRef.current;
    if (viewport) {
      const handleFocus = () => {
        toastElementsMapRef.current.forEach((toast) => {
          toast.setAttribute('data-hovering', 'true');
        });
      };
      const handleBlur = (event: Event) => {
        if (
          !viewport.contains(event.target as Node) ||
          viewport === event.target
        ) {
          toastElementsMapRef.current.forEach((toast) => {
            toast.setAttribute('data-hovering', 'false');
          });
        }
      };
      viewport.addEventListener('pointermove', handleFocus);
      viewport.addEventListener('pointerleave', handleBlur);
      viewport.addEventListener('focusin', handleFocus);
      viewport.addEventListener('focusout', handleBlur);
      return () => {
        viewport.removeEventListener('pointermove', handleFocus);
        viewport.removeEventListener('pointerleave', handleBlur);
        viewport.removeEventListener('focusin', handleFocus);
        viewport.removeEventListener('focusout', handleBlur);
      };
    }
    return () => {};
  }, []);

  const addToast = useMemo(
    () =>
      Object.assign(handleDispatch, {
        success: handleDispatchSuccess,
        error: handleDispatchError,
        warning: handleDispatchWarning,
        info: handleDispatchInfo,
        delete: handleRemoveToast,
      }),
    [
      handleDispatch,
      handleDispatchSuccess,
      handleDispatchError,
      handleDispatchWarning,
      handleDispatchInfo,
      handleRemoveToast,
    ]
  );

  const toastStack = useMemo(
    () => ({
      toastElementsMapRef,
      sortToasts,
    }),
    [sortToasts]
  );

  return show ? (
    <ToastContext.Provider value={addToast}>
      <ToastContextImpl.Provider value={toastStack}>
        <ToastPrimitive.Provider {...props}>
          {children}
          {Array.from(toasts).map(([key, toast]) => (
            <ToastItem
              key={key}
              id={key}
              toast={toast}
              onOpenChange={(open: boolean) => {
                if (!open) {
                  toastElementsMapRef.current.delete(key);
                  sortToasts();
                  if (!open) {
                    setTimeout(() => {
                      handleRemoveToast(key);
                    }, ANIMATION_OUT_DURATION);
                  }
                }
              }}
            />
          ))}
          <ToastPrimitive.Viewport ref={viewportRef} css={viewportStyles} />
        </ToastPrimitive.Provider>
      </ToastContextImpl.Provider>
    </ToastContext.Provider>
  ) : (
    <>{children}</>
  );
};
