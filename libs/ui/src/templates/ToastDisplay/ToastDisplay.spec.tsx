import { useToast } from '@decipad/toast';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FC } from 'react';
import { ToastDisplay } from './ToastDisplay';

const ToastButton = (): ReturnType<FC> => {
  const toast = useToast();

  return (
    <button onClick={() => toast('Toastie toast', 'info')}>Click me</button>
  );
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
