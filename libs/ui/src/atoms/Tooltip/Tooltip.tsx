import { css, CSSObject } from '@emotion/react';
import { Position, TooltipPopup, useTooltip } from '@reach/tooltip';
import React, { CSSProperties, FC, ReactElement, ReactNode } from 'react';
import { Portal } from 'react-portal';
import {
  cssVar,
  darkTheme,
  p16Regular,
  setCssVar,
  white,
} from '../../primitives';

const triangleHeight = 10;
const triangleWidthPerSide = 10;
/**
 * This function determines the position of the triangle of the tooltip.
 * @param triggerRect The trigger of the tooltip.
 * @returns The left and top positions for the triangle of the tooltip.
 */
export const trianglePosition = (
  triggerRect: DOMRect | null
): Pick<CSSObject, 'top' | 'left'> => {
  if (triggerRect) {
    return {
      left: Math.max(
        0,
        triggerRect.left,
        triggerRect.left - triangleWidthPerSide + triggerRect.width / 2
      ),
      top: triggerRect.bottom + window.scrollY,
    };
  }
  return {};
};
/**
 * This function returns an emotion css styles for the triangle of the tooltip.
 * @param triggerRect The trigger of the tooltip.
 * @returns The necessary styles for the triangle of the tooltip.
 */
const triangleStyles = (triggerRect: DOMRect | null) =>
  css(trianglePosition(triggerRect), {
    zIndex: 1,

    position: 'absolute',
    width: 0,
    height: 0,

    borderLeft: `${triangleWidthPerSide}px solid transparent`,
    borderRight: `${triangleWidthPerSide}px solid transparent`,
    borderBottom: `${triangleHeight}px solid`,
    borderBottomColor: cssVar('strongTextColor'),
  });

/**
 * This function returns the correct position of the tooltip's box relative to the trigger.
 * @param triggerRect The trigger or button of the tooltip.
 * @param tooltipRect The tooltip's box itself.
 * @returns an object with the left and top positions for the tooltip.
 */
export const tooltipPosition: Position = (triggerRect, tooltipRect) => {
  if (triggerRect && tooltipRect) {
    const triggerCenter = triggerRect.left + triggerRect.width / 2;
    const left = triggerCenter - tooltipRect.width / 2;
    const maxLeft = window.innerWidth - tooltipRect.width;
    const pos: CSSProperties = {
      left: Math.max(0, Math.min(left, maxLeft)) + window.scrollX,
      top: triggerRect.bottom + 8 + window.scrollY,
    };
    return pos;
  }
  return {};
};
/**
 * The tooltip rectangular box styles.
 */
const tooltipRectStyles = css({
  position: 'absolute',
  pointerEvents: 'none',

  ...darkTheme,
  background: cssVar('backgroundColor'),
  ...setCssVar('currentTextColor', cssVar('strongTextColor')),
  ...p16Regular,

  borderRadius: '6px',
  border: `1px solid ${white.rgb}`,
  padding: '10px 14px',
  margin: '0px 2px',
});

export interface TooltipProps {
  children: ReactNode;
  button: ReactElement;
}

/**
 * This is a tooltip component that adheres to the deci design system.
 * @param children The content inside of the tooltip.
 * @param button The trigger button of the tooltip.
 * @returns The tooltip component.
 */
export const Tooltip = ({ children, button }: TooltipProps): ReturnType<FC> => {
  const [trigger, tooltip] = useTooltip();

  const { isVisible, triggerRect } = tooltip;

  return (
    <>
      {React.cloneElement(button, trigger)}

      {isVisible && (
        <Portal>
          <div role="presentation" css={triangleStyles(triggerRect)} />
        </Portal>
      )}

      <TooltipPopup
        {...tooltip}
        label={children}
        position={tooltipPosition}
        css={tooltipRectStyles}
      />
    </>
  );
};
