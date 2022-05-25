import { fireEvent, render, screen } from '@testing-library/react';
import { Slider } from './Slider';

it('renders a slider', () => {
  render(<Slider />);
  expect(screen.getByRole('slider')).toBeVisible();
});

describe('onChange prop', () => {
  it('called when value changes', () => {
    const onChange = jest.fn();
    render(<Slider onChange={onChange} value={10} />);
    fireEvent.change(screen.getByRole('slider'), { target: { value: '23' } });
    expect(onChange).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith(23);
  });
});

it('sets the slider max', () => {
  render(<Slider max={10} />);
  expect((screen.getByRole('slider') as HTMLInputElement).max).toBe('10');
});

it('sets the slider min', () => {
  render(<Slider min={10} />);
  expect((screen.getByRole('slider') as HTMLInputElement).min).toBe('10');
});

it('sets the slider step', () => {
  render(<Slider step={10} />);
  expect((screen.getByRole('slider') as HTMLInputElement).step).toBe('10');
});

it('sets the slider value', () => {
  render(<Slider value={10} />);
  expect((screen.getByRole('slider') as HTMLInputElement).value).toBe('10');
});
