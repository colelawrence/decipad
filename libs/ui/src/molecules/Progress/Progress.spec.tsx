import { render } from '@testing-library/react';
import { Progress } from './Progress';

it('renders progress component', () => {
  const { getByText } = render(<Progress progress={10} label="progress" />);
  expect(getByText('progress')).toBeInTheDocument();
});

it('width adapts to progress', () => {
  const { getByText } = render(<Progress progress={50} label="progress" />);
  expect(getByText('progress').parentElement).toHaveStyle('width: 50%');
});

it('changes width when progress changes', () => {
  let v = 50;
  const { rerender, getByText } = render(
    <Progress progress={v} label="progress" />
  );
  expect(getByText('progress').parentElement).toHaveStyle('width: 50%');

  v = 100;
  rerender(<Progress progress={v} label="progress" />);
  expect(getByText('progress').parentElement).toHaveStyle('width: 100%');
});
