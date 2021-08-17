import { render } from '@testing-library/react';
import { Placeholder } from './Placeholder';

it('can be made less round', () => {
  const { getByRole, rerender } = render(<Placeholder />);
  const normalBorderRadius = Number(
    getComputedStyle(getByRole('presentation')).borderRadius.replace(/px$/, '')
  );

  rerender(<Placeholder lessRound />);
  const lessRoundBorderRadius = Number(
    getComputedStyle(getByRole('presentation')).borderRadius.replace(/px$/, '')
  );
  expect(lessRoundBorderRadius).toBeLessThan(normalBorderRadius);
});
