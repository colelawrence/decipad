import { createContext, useContext, ContextType } from 'react';

export type ToastType = 'info' | 'success' | 'warning' | 'error';
export const ToastContext = createContext(
  (message: string, type: ToastType): void => {
    console.error(
      'Attempted to create a toast of type',
      type,
      'but there is no way of showing toasts provided. Toast message:',
      message
    );
    throw new Error(
      'Attempted to create a toast but there is no way of showing toasts provided.'
    );
  }
);

export const useToast = (): ContextType<typeof ToastContext> =>
  useContext(ToastContext);
