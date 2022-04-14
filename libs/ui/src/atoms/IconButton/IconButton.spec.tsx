import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import { noop } from '@decipad/utils';

import { IconButton } from './IconButton';

it('renders the button icon', () => {
  const { getByTitle } = render(
    <IconButton onClick={noop}>
      <svg>
        <title>Pretty Icon</title>
      </svg>
    </IconButton>
  );
  expect(getByTitle('Pretty Icon')).toBeInTheDocument();
});

it('emits click events', async () => {
  const handleClick = jest.fn();
  const { getByRole } = render(
    <IconButton onClick={handleClick}>icon</IconButton>
  );

  await userEvent.click(getByRole('button'));
  expect(handleClick).toHaveBeenCalled();
});

describe('roundedSquare', () => {
  it('changes the border radius', () => {
    const { rerender, getByRole } = render(
      <IconButton onClick={noop}>icon</IconButton>
    );
    const { borderRadius: normalBorderRadius } = getComputedStyle(
      getByRole('button')
    );

    rerender(
      <IconButton onClick={noop} roundedSquare>
        icon
      </IconButton>
    );
    const { borderRadius: roundedSquareBorderRadius } = getComputedStyle(
      getByRole('button')
    );

    expect(roundedSquareBorderRadius).not.toEqual(normalBorderRadius);
  });
});

describe('with an href', () => {
  it('renders as a link', () => {
    const { getByRole } = render(<IconButton href="/page">icon</IconButton>);
    expect(getByRole('link')).toHaveAttribute('href', '/page');
  });
});
