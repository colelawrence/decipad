import { render, screen } from '@testing-library/react';
import { KeyboardKey } from './KeyboardKey';

describe('testing KeyboardKey component', () => {
  it('should render KeyboardKey component without variant', () => {
    render(<KeyboardKey>Hello</KeyboardKey>);

    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
