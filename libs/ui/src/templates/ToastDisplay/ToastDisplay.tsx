import { ToastContext, ToastType } from '@decipad/toast';
import { ComponentType, useCallback, ReactNode } from 'react';
import * as ReactToastNotifications from 'react-toast-notifications';
import { Toast } from '../../atoms';
import { toastTransitionDelay } from '../../primitives';

const ToastProvider: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => {
  const { addToast } = ReactToastNotifications.useToasts();

  const add = useCallback(
    (message: ReactNode | string, type: ToastType, options = {}) => {
      addToast(message, { appearance: type, ...options });
    },
    [addToast]
  );

  return <ToastContext.Provider value={add}>{children}</ToastContext.Provider>;
};

export const ToastDisplay: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => {
  return (
    <ReactToastNotifications.ToastProvider
      components={{
        Toast: Toast as ComponentType<ReactToastNotifications.ToastProps>,
      }}
      autoDismiss
      autoDismissTimeout={toastTransitionDelay}
      placement="top-center"
    >
      <ToastProvider>{children}</ToastProvider>
    </ReactToastNotifications.ToastProvider>
  );
};
