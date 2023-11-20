import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AssistantMessageInput } from './AssistantMessageInput';
import { noop } from '@decipad/utils';

describe('<AssistantMessageInput />', () => {
  it('renders correctly', () => {
    render(<AssistantMessageInput isGenerating={false} onSubmit={noop} />);
    expect(
      screen.getByPlaceholderText(/what can i do for you/i)
    ).toBeInTheDocument();
  });

  it('updates value on input change', async () => {
    const { getByTestId } = render(
      <AssistantMessageInput isGenerating={false} onSubmit={noop} />
    );
    const input = getByTestId('message-input') as HTMLInputElement;
    await userEvent.type(input, 'Test Message');
    expect(input.value).toBe('Test Message');
  });

  it('enables/disables submit button based on input and isGenerating', async () => {
    const { rerender, getByTestId } = render(
      <AssistantMessageInput isGenerating={false} onSubmit={noop} />
    );
    const submitButton = screen.getByRole('button');
    expect(submitButton).toBeDisabled();

    rerender(<AssistantMessageInput isGenerating={true} onSubmit={noop} />);
    expect(submitButton).toBeDisabled();

    rerender(<AssistantMessageInput isGenerating={false} onSubmit={noop} />);
    await userEvent.type(getByTestId('message-input'), 'Test');
    expect(submitButton).not.toBeDisabled();
  });

  it('calls onSubmit when form is submitted', async () => {
    const mockOnSubmit = jest.fn();
    const { getByTestId } = render(
      <AssistantMessageInput isGenerating={false} onSubmit={mockOnSubmit} />
    );
    const input = getByTestId('message-input');
    const form = getByTestId('message-form');

    await userEvent.type(input, 'Test Message');

    fireEvent.submit(form);

    expect(mockOnSubmit).toHaveBeenCalledWith('Test Message');
  });

  it('submits form on Enter key press', async () => {
    const mockOnSubmit = jest.fn();
    const { getByTestId } = render(
      <AssistantMessageInput isGenerating={false} onSubmit={mockOnSubmit} />
    );
    const input = getByTestId('message-input');

    await userEvent.type(input, 'Test Message{enter}');

    expect(mockOnSubmit).toHaveBeenCalledWith('Test Message');
  });
});
