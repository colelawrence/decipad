import { ToastStatus, useToast } from '@decipad/toast';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FC } from 'react';
import { ToastDisplay } from './ToastDisplay';

type ToastButtonProps = {
  type: ToastStatus;
};

const ToastButton: React.FC<ToastButtonProps> = ({ type }): ReturnType<FC> => {
  const toast = useToast();

  return (
    <button onClick={() => toast(`Toast ${type}`, type)}>
      Add {type} toast
    </button>
  );
};

describe('Toast Display', () => {
  it('renders a toast on click', async () => {
    const { getByText } = render(
      <ToastDisplay>
        <ToastButton type="info" />
      </ToastDisplay>
    );

    await userEvent.click(getByText('Add info toast'));

    expect(getByText('Toast info')).toBeInTheDocument();
  });

  it('renders second toast on top', async () => {
    const { getByText } = render(
      <ToastDisplay>
        <ToastButton type="info" />
        <ToastButton type="error" />
      </ToastDisplay>
    );

    await userEvent.click(getByText('Add info toast'));
    await userEvent.click(getByText('Add error toast'));

    expect(getByText('Toast info')).toBeInTheDocument();
    expect(getByText('Toast error')).toBeInTheDocument();

    expect(
      getByText('Toast error').parentElement?.parentElement?.parentElement
    ).toHaveAttribute('data-front', 'true');
  });
});
