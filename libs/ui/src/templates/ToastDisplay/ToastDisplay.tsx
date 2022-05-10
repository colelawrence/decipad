import { ComponentType } from 'react';
import { ToastContext } from '@decipad/toast';
import * as ReactToastNotifications from 'react-toast-notifications';
import { Toast } from '../../atoms';
import { toastTransitionDelay } from '../../primitives';

const ToastProvider: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => {
  const { addToast } = ReactToastNotifications.useToasts();
  return (
    <ToastContext.Provider
      value={(message, type, options = {}) => {
        addToast(message, { appearance: type, ...options });
      }}
    >
      {children}
    </ToastContext.Provider>
  );
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
      placement="bottom-right"
    >
      <ToastProvider>{children}</ToastProvider>
    </ReactToastNotifications.ToastProvider>
  );
};
