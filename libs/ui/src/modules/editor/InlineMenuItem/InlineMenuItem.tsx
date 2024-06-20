/* eslint decipad/css-prop-named-variable: 0 */
import {
  useCurrentWorkspaceStore,
  useNotebookMetaData,
} from '@decipad/react-contexts';
import { useWindowListener } from '@decipad/react-utils';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { FC, ReactNode, useCallback, useRef } from 'react';
import {
  componentCssVars,
  cssVar,
  p10Bold,
  p12Regular,
  p14Medium,
} from '../../../primitives';
import { soonStyles } from '../../../styles/menu';
import { useCancelingEvent } from '../../../utils';

const TextStyles = styled.div({
  display: 'grid',
  textAlign: 'start',
  rowGap: '2px',
});

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

const Badge = styled.span(p10Bold, {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '2px 4px',
  borderRadius: 4,
  marginLeft: 4,
  lineHeight: 1,
  textTransform: 'uppercase',
  color: componentCssVars('ButtonPrimaryDefaultText'),
  backgroundColor: componentCssVars('ButtonPrimaryDefaultBackground'),
});

const iconStyles = css({
  width: '40px',
  height: '40px',
  display: 'grid',
  borderRadius: 8,
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

  const { setIsUpgradeWorkspaceModalOpen } = useCurrentWorkspaceStore();
  const { workspacePlan } = useNotebookMetaData();
  const isFeatureAvailableForCurrentPlan =
    !restrictToPlans ||
    (workspacePlan &&
      restrictToPlans &&
      restrictToPlans.includes(workspacePlan));

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (focused && event.key === 'Enter' && !event.shiftKey) {
        if (isFeatureAvailableForCurrentPlan) {
          enabled && onExecute();
        } else {
          setIsUpgradeWorkspaceModalOpen(true);
        }
        event.stopPropagation();
        event.preventDefault();
      }
    },
    [
      onExecute,
      focused,
      enabled,
      isFeatureAvailableForCurrentPlan,
      setIsUpgradeWorkspaceModalOpen,
    ]
  );
  useWindowListener('keydown', onKeyDown, true);

  if (focused) {
    itemRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    });
  }

  const menuItem = (
    <button
      role="menuitem"
      data-testid={testId}
      css={inlineMenuStyles}
      onMouseDown={useCancelingEvent((event) => {
        // we don't want to trigger any of this if the user/devs use the right button
        if (event.button === 0) {
          if (isFeatureAvailableForCurrentPlan) {
            enabled && onExecute();
          } else {
            setIsUpgradeWorkspaceModalOpen(true);
          }
        }
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
      <TextStyles>
        <div css={inlineStyles}>
          <strong css={titleStyles}>{title}</strong>
          {!enabled && <span css={soonStyles}>SOON</span>}
          {!isFeatureAvailableForCurrentPlan && <Badge>Upgrade</Badge>}
        </div>
        <span css={descriptionStyles}>{description}</span>
      </TextStyles>
    </button>
  );

  return menuItem;
};
