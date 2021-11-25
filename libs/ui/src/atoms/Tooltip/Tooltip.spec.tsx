import { render } from '@testing-library/react';
import fc from 'fast-check';
import { Tooltip, trianglePosition, tooltipPosition } from './Tooltip';

it('renders the trigger button', () => {
  const { getByText } = render(
    <Tooltip button={<button>hover me</button>}>
      <div>John Doe</div>
    </Tooltip>
  );

  expect(getByText('hover me')).toBeVisible();
});

it('renders the tooltip on focus', async () => {
  const { getByText } = render(
    <Tooltip button={<button>click me</button>}>
      <div>John Doe</div>
    </Tooltip>
  );

  getByText('click me').focus();

  expect(getByText('John Doe')).toBeVisible();
});

describe('the tooltip', () => {
  const xAndWidth = fc
    .tuple(
      fc.integer(0, window.innerWidth - 1),
      fc.integer(1, window.innerWidth - 1)
    )
    .filter(([x, width]) => x + width <= window.innerWidth);
  const yAndHeight = fc
    .tuple(
      fc.integer(0, window.innerHeight - 1),
      fc.integer(1, window.innerHeight - 1)
    )
    .filter(([x, width]) => x + width <= window.innerHeight);

  it('is never positioned outside the screen', () => {
    fc.assert(
      fc.property(
        xAndWidth,
        yAndHeight,
        xAndWidth,
        yAndHeight,
        (
          [triggerX, triggerWidth],
          [triggerY, triggerHeight],
          [tooltipX, tooltipWidth],
          [tooltipY, tooltipHeight]
        ) => {
          const { left, top } = tooltipPosition(
            {
              left: triggerX,
              width: triggerWidth,
              right: triggerX + triggerWidth,
              top: triggerY,
              height: triggerHeight,
              bottom: triggerY + triggerHeight,
            },
            {
              left: tooltipX,
              width: tooltipWidth,
              right: triggerX + triggerWidth,
              top: tooltipY,
              height: tooltipHeight,
              bottom: triggerY + triggerHeight,
            }
          );
          expect(left).toBeGreaterThanOrEqual(0);
          expect(left).toBeLessThanOrEqual(window.innerWidth - tooltipWidth);
          expect(top).toBeGreaterThanOrEqual(0);
          // Tolerance at the bottom since vertical scrolling to see the tooltip is acceptable
          expect(top).toBeLessThanOrEqual(window.innerHeight + 10);
        }
      )
    );
  });

  it('is always with its triangle', () => {
    fc.assert(
      fc.property(
        xAndWidth,
        yAndHeight,
        xAndWidth,
        yAndHeight,
        (
          [triggerX, triggerWidth],
          [triggerY, triggerHeight],
          [tooltipX, tooltipWidth],
          [tooltipY, tooltipHeight]
        ) => {
          const tooltip = tooltipPosition(
            {
              left: triggerX,
              width: triggerWidth,
              right: triggerX + triggerWidth,
              top: triggerY,
              height: triggerHeight,
              bottom: triggerY + triggerHeight,
            },
            {
              left: tooltipX,
              width: tooltipWidth,
              right: tooltipX + tooltipWidth,
              top: tooltipY,
              height: tooltipHeight,
              bottom: tooltipY + tooltipHeight,
            }
          );
          const triangle = trianglePosition(
            DOMRect.fromRect({
              x: triggerX,
              width: triggerWidth,
              y: triggerY,
              height: triggerHeight,
            })
          );
          expect(triangle.top).toBeCloseTo(Number(tooltip.top) - 10, -1);
          expect(triangle.left).toBeGreaterThan(Number(tooltip.left) - 10);
          expect(triangle.left).toBeLessThan(
            Number(tooltip.left) + tooltipWidth
          );
        }
      )
    );
  });
});
