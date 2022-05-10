import { createContext, useContext, ContextType } from 'react';
import { Options as ToastOptions } from 'react-toast-notifications';

export type ToastType = 'info' | 'success' | 'warning' | 'error';
export const ToastContext = createContext(
  (message: string, type: ToastType, _options?: ToastOptions): void => {
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
