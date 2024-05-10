/* eslint decipad/css-prop-named-variable: 0 */
import { useNotebookMetaData } from '@decipad/react-contexts';
import { useWindowListener } from '@decipad/react-utils';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { Tooltip } from 'libs/ui/src/shared';
import { FC, ReactNode, useCallback, useRef } from 'react';
import {
  componentCssVars,
  cssVar,
  p12Medium,
  p12Regular,
  p14Medium,
} from '../../../primitives';
import { soonStyles } from '../../../styles/menu';
import { useCancelingEvent } from '../../../utils';

const inlineMenuStyles = css({
  display: 'grid',
  alignItems: 'center',
  gridTemplateColumns: 'auto 1fr',
  columnGap: '12px',

  clipPath: 'inset(-8px -8px -8px -8px round 8px)',
  ':hover, &[data-focused="true"]': {
    backgroundColor: cssVar('backgroundAccent'),
    boxShadow: `0px 0px 0px 8px ${cssVar('backgroundAccent')}`,
  },
});

const iconStyles = css({
  width: '40px',
  height: '40px',
  display: 'grid',
  borderRadius: 8,
});

const textStyles = css({
  display: 'grid',
  textAlign: 'start',
  rowGap: '2px',
});

const inlineStyles = css({
  display: 'flex',
  gap: '8px',
});

const titleStyles = css(p14Medium, { color: cssVar('textTitle') });
const descriptionStyles = css(p12Regular);

interface InlineMenuItemProps {
  readonly icon: ReactNode;
  readonly title: string;
  readonly description: string;
  readonly enabled: boolean;
  readonly hidden?: boolean;
  /**
   * Unfortunately, we cannot use real browser focus for this menu since we need the editor to stay focused.
   * Even a "switching focus back and forth on key presses" does not work well enough because Slate tends to lose selection state on blur.
   */
  readonly focused?: boolean;
  readonly onExecute?: () => void;
  readonly 'data-testid'?: string;
  readonly restrictToPlans?: string[];
}
export const InlineMenuItem = ({
  icon,
  title,
  description,
  enabled,
  focused,
  restrictToPlans,
  onExecute = noop,
  'data-testid': testId,
}: InlineMenuItemProps): ReturnType<FC> => {
  const itemRef = useRef<HTMLButtonElement>(null);

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (focused && event.key === 'Enter' && !event.shiftKey) {
        enabled && onExecute();
        event.stopPropagation();
        event.preventDefault();
      }
    },
    [onExecute, focused, enabled]
  );
  useWindowListener('keydown', onKeyDown, true);

  if (focused) {
    itemRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    });
  }

  const { workspacePlan } = useNotebookMetaData();

  const isFeatureAvailableForCurrentPlan =
    !restrictToPlans ||
    (workspacePlan &&
      restrictToPlans &&
      restrictToPlans.includes(workspacePlan));

  const menuItem = (
    <button
      role="menuitem"
      data-testid={testId}
      css={inlineMenuStyles}
      onMouseDown={useCancelingEvent(() => {
        enabled && isFeatureAvailableForCurrentPlan && onExecute();
      })}
      data-focused={focused}
      ref={itemRef}
    >
      <span
        css={[
          iconStyles,
          (!enabled || !isFeatureAvailableForCurrentPlan) &&
            css({ opacity: '0.5' }),
        ]}
      >
        {icon}
      </span>
      <div css={textStyles}>
        <div css={inlineStyles}>
          <strong css={titleStyles}>{title}</strong>
          {!enabled && <span css={soonStyles}>SOON</span>}
        </div>
        <span css={descriptionStyles}>{description}</span>
      </div>
    </button>
  );

  return isFeatureAvailableForCurrentPlan ? (
    menuItem
  ) : (
    <Tooltip trigger={menuItem} side="right">
      <div css={{ width: '140px' }}>
        <p css={toolTipTitle}>Unlock submit form</p>
        <p css={tooltipContent}>
          Upgrade your current plan to {(restrictToPlans ?? []).join(', ')} to
          use this feature
        </p>
      </div>
    </Tooltip>
  );
};

const toolTipTitle = css(p12Medium, {
  textAlign: 'center',
  color: componentCssVars('TooltipText'),
});
const tooltipContent = css(p12Regular, {
  marginTop: '6px',
  color: componentCssVars('TooltipTextSecondary'),
  textAlign: 'center',
});
