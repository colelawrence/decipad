import { render, screen } from '@testing-library/react';
import { CodeLineFloat } from './CodeLineFloat';

describe('Testing CodelineFloat component', () => {
  it('should render the component', () => {
    render(<CodeLineFloat offsetTop={10}>Hello</CodeLineFloat>);

    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
