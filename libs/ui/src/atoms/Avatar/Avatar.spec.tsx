import { render } from '@testing-library/react';
import { findParentWithStyle } from '@decipad/dom-test-utils';
import { Avatar } from './Avatar';

it('generates a label text', () => {
  const { getByLabelText } = render(<Avatar name="John Doe" />);
  expect(getByLabelText(/avatar/i)).toBeVisible();
});

it("shows the user's first initial", () => {
  const { container } = render(<Avatar name="John Doe" />);
  expect(container).toHaveTextContent('J');
});

describe('roundedSquare', () => {
  it('changes the border radius', () => {
    const { getByText, rerender } = render(<Avatar name="John Doe" />);
    const normalBorderRadius = findParentWithStyle(
      getByText(/.+/),
      'borderRadius'
    );

    rerender(<Avatar name="John Doe" roundedSquare />);
    const roundedSquareBorderRadius = findParentWithStyle(
      getByText(/.+/),
      'borderRadius'
    );

    expect(roundedSquareBorderRadius).not.toEqual(normalBorderRadius);
  });
});
