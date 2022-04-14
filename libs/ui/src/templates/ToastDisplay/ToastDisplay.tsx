import { ToastContext } from '@decipad/toast';
import * as ReactToastNotifications from 'react-toast-notifications';
import { Toast } from '../../atoms';

const ToastProvider: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => {
  const { addToast } = ReactToastNotifications.useToasts();
  return (
    <ToastContext.Provider
      value={(message, type) => {
        addToast(message, { appearance: type });
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
      components={{ Toast }}
      autoDismiss
      placement="bottom-right"
    >
      <ToastProvider>{children}</ToastProvider>
    </ReactToastNotifications.ToastProvider>
  );
};
