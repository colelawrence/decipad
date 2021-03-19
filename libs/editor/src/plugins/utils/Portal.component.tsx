import { createPortal } from 'react-dom';

export const Portal = ({
  children,
}: {
  children: JSX.Element;
}): React.ReactPortal => {
  return typeof document !== 'undefined'
    ? createPortal(children, document.body)
    : null;
};
