import { render } from '@testing-library/react';
import { findParentWithStyle } from '../../test-utils';
import { Avatar } from './Avatar';

it('generates a label text', () => {
  const { getByLabelText } = render(<Avatar userName="John Doe" />);
  expect(getByLabelText(/avatar/i)).toBeVisible();
});

it("shows the user's first initial", () => {
  const { container } = render(<Avatar userName="John Doe" />);
  expect(container).toHaveTextContent('J');
});

describe('roundedSquare', () => {
  it('changes the border radius', () => {
    const { getByText, rerender } = render(<Avatar userName="John Doe" />);
    const normalBorderRadius = findParentWithStyle(
      getByText(/.+/),
      'borderRadius'
    );

    rerender(<Avatar userName="John Doe" roundedSquare />);
    const roundedSquareBorderRadius = findParentWithStyle(
      getByText(/.+/),
      'borderRadius'
    );

    expect(roundedSquareBorderRadius).not.toEqual(normalBorderRadius);
  });
});
