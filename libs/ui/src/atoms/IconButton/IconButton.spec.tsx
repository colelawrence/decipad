import { noop } from '@decipad/utils';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IconButton } from './IconButton';

it('renders the button icon', () => {
  render(
    <IconButton onClick={noop}>
      <svg>
        <title>Pretty Icon</title>
      </svg>
    </IconButton>
  );
  expect(screen.getByTitle('Pretty Icon')).toBeInTheDocument();
});

it('emits click events', async () => {
  const handleClick = jest.fn();
  render(<IconButton onClick={handleClick}>icon</IconButton>);

  await userEvent.click(screen.getByRole('button'));
  expect(handleClick).toHaveBeenCalled();
});

describe('roundedSquare', () => {
  it('changes the border radius', () => {
    const { rerender } = render(<IconButton onClick={noop}>icon</IconButton>);
    const { borderRadius: normalBorderRadius } = getComputedStyle(
      screen.getByRole('button')
    );

    rerender(
      <IconButton onClick={noop} roundedSquare>
        icon
      </IconButton>
    );
    const { borderRadius: roundedSquareBorderRadius } = getComputedStyle(
      screen.getByRole('button')
    );

    expect(roundedSquareBorderRadius).not.toEqual(normalBorderRadius);
  });
});

describe('with an href', () => {
  it('renders as a link', () => {
    render(<IconButton href="/page">icon</IconButton>);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/page');
  });
});
