import { createContext, useContext } from 'react';

export type ToastStatus =
  | 'info'
  | 'success'
  | 'soft-warning'
  | 'warning'
  | 'error';

export type ToastOptions = {
  autoDismiss?: boolean;
  duration?: number;
};

export type ToastType = {
  content: string | JSX.Element;
  status: ToastStatus;
  options: ToastOptions;
  open: boolean;
};

type ToastContextType = {
  (
    content: ToastType['content'],
    status: ToastType['status'],
    options?: ToastType['options']
  ): string;
  success: (
    content: ToastType['content'],
    options?: ToastType['options']
  ) => string;
  error: (
    content: ToastType['content'],
    options?: ToastType['options']
  ) => string;
  warning: (
    content: ToastType['content'],
    options?: ToastType['options']
  ) => string;
  info: (
    content: ToastType['content'],
    options?: ToastType['options']
  ) => string;
  delete: (id: string) => void;
};

type ToastContextImlpType = {
  sortToasts: () => void;
  toastElementsMapRef: React.MutableRefObject<Map<string, HTMLLIElement>>;
};

export const ToastContext = createContext<ToastContextType | undefined>(
  undefined
);

export const ToastContextImpl = createContext<ToastContextImlpType | undefined>(
  undefined
);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context) return context;
  throw new Error('useToast must be used within Toasts');
};

export const useToastContext = () => {
  const context = useContext(ToastContextImpl);
  if (context) return context;
  throw new Error('useToast must be used within Toasts');
};
