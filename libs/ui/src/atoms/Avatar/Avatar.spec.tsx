import { findParentWithStyle } from '@decipad/dom-test-utils';
import { render, screen } from '@testing-library/react';
import { Avatar } from './Avatar';

it('generates a label text', () => {
  render(<Avatar name="John Doe" />);
  expect(screen.getByLabelText(/avatar/i)).toBeVisible();
});

it("shows the user's first initial", () => {
  const { container } = render(<Avatar name="John Doe" />);
  expect(container).toHaveTextContent('J');
});

describe('roundedSquare', () => {
  it('changes the border radius', () => {
    const { rerender } = render(<Avatar name="John Doe" />);
    const normalBorderRadius = findParentWithStyle(
      screen.getByText(/.+/),
      'borderRadius'
    );

    rerender(<Avatar name="John Doe" roundedSquare />);
    const roundedSquareBorderRadius = findParentWithStyle(
      screen.getByText(/.+/),
      'borderRadius'
    );

    expect(roundedSquareBorderRadius).not.toEqual(normalBorderRadius);
  });
});
