import { render, screen } from '@testing-library/react';
import { Placeholder } from './Placeholder';

it('can be made less round', () => {
  const { rerender } = render(<Placeholder />);
  const normalBorderRadius = Number(
    getComputedStyle(screen.getByRole('presentation')).borderRadius.replace(
      /px$/,
      ''
    )
  );

  rerender(<Placeholder lessRound />);
  const lessRoundBorderRadius = Number(
    getComputedStyle(screen.getByRole('presentation')).borderRadius.replace(
      /px$/,
      ''
    )
  );
  expect(lessRoundBorderRadius).toBeLessThan(normalBorderRadius);
});
