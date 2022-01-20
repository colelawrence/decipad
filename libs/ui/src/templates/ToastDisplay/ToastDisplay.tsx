import { ToastProvider } from 'react-toast-notifications';
import { Toast } from '../../atoms';

export const ToastDisplay: React.FC = ({ children }) => {
  return (
    <ToastProvider components={{ Toast }} autoDismiss placement="bottom-right">
      {children}
    </ToastProvider>
  );
};
