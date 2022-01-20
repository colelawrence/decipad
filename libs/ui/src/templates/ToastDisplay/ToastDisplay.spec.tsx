import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FC } from 'react';
import { useToasts } from 'react-toast-notifications';
import { ToastDisplay } from './ToastDisplay';

const ToastButton = (): ReturnType<FC> => {
  const { addToast } = useToasts();

  return <button onClick={() => addToast('Toastie toast')}>Click me</button>;
};

describe('Toast Display', () => {
  it('renders a toast on click', () => {
    const { getByText } = render(
      <ToastDisplay>
        <ToastButton />
      </ToastDisplay>
    );

    userEvent.click(getByText('Click me'));

    expect(getByText('Toastie toast')).toBeInTheDocument();
  });
});
