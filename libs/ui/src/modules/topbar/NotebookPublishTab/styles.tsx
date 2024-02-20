/* eslint-disable camelcase */
import { css } from '@emotion/react';
import {
  componentCssVars,
  cssVar,
  p12Regular,
  p13Medium,
  p13Regular,
  p14Medium,
  p14Regular,
  p8Medium,
} from '../../../primitives';
import { Link } from '../../../shared';
import { FC } from 'react';
import { Publish_State } from '@decipad/graphql-client';
import {
  NotebookMetaActionsReturn,
  PublishedVersionState,
} from '@decipad/interfaces';
import { format } from 'date-fns';

export const innerPopUpStyles = css({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  gap: '16px',
});

export const groupStyles = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

export const horizontalGroupStyles = css(groupStyles, { flexDirection: 'row' });

export const titleAndToggleStyles = css(horizontalGroupStyles, {
  justifyContent: 'space-between',

  alignItems: 'center',

  button: {
    height: 18,
    width: 34,
  },
  'button span': {
    height: 14,
    width: 14,
  },
});

export const titleStyles = css({
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
});

/**
 * The styles for the parent div that wraps the copy button and the text box.
 */
export const clipboardWrapperStyles = css({
  height: '32px',
  border: '1px solid',
  borderColor: cssVar('backgroundHeavy'),
  borderRadius: '6px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  whiteSpace: 'nowrap',
});

export const copyButtonStyles = css(p13Regular, {
  height: '100%',
  backgroundColor: cssVar('backgroundHeavy'),
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  padding: '0px 8px 0px 4px',
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    svg: {
      width: '16px',
      height: '16px',
    },
  },
});

export const copyInnerButtonStyles = css(p13Regular, {
  fontWeight: 700,
  color: cssVar('textHeavy'),
  padding: '0px 2px',
});

/**
 * The link text box on the right side of the copy button styles.
 */
export const padLinkTextStyles = css(p13Regular, {
  userSelect: 'all',

  width: '100%',
  overflow: 'hidden',
  padding: '0px 6px',
});

export const triggerStyles = css(p13Medium, {
  display: 'flex',
  justifyContent: 'space-between',
  borderRadius: '6px',
  height: '32px',
  border: `1px solid ${cssVar('borderSubdued')}`,
  padding: '8px',
  svg: { width: '16px', height: '16px' },
});

export const triggerTitleIconStyles = css({
  display: 'flex',
  gap: '4px',
});

export const publishModeWrapper = css({
  backgroundColor: cssVar('backgroundMain'),
  border: `1px solid ${cssVar('borderSubdued')}`,
  marginTop: '4px',
  width: 'calc(320px - 32px)',
  borderRadius: '8px',
  display: 'flex',
  overflow: 'hidden',
  flexDirection: 'column',
  padding: '6px',
  gap: '2px',
  zIndex: 10000,
  svg: {
    width: '24px',
    height: '24px',
  },
});

export const publishMode = css({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '8px 12px 8px 8px',
  cursor: 'pointer',
  borderRadius: '6px',

  ':hover:not([aria-disabled="true"])': {
    background: cssVar('backgroundDefault'),
  },

  '&[aria-selected="true"]:not([aria-disabled="true"])': {
    background: cssVar('backgroundDefault'),
  },

  '& > div': {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1,
  },
  p: {
    ...p13Medium,
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    svg: {
      width: '16px',
      height: '16px',
    },
  },
  span: {
    ...p12Regular,
    lineHeight: '16px',
    fontWeight: 400,
    color: cssVar('textSubdued'),
  },
  svg: {
    width: '16px',
    height: '16px',
  },
});

export const requiresUpgradeStyles = css(p8Medium, {
  display: 'flex',
  padding: '4px',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '4px',
  background: componentCssVars('RequiresPremium'),
  color: componentCssVars('RequiresPremiumText'),
  textTransform: 'uppercase',
});

export const publishNewChangesStyles = css({
  display: 'flex',
  alignItems: 'baseline',
  gap: '6px',
});

const publishWritingP = css(p14Medium, { color: cssVar('textHeavy') });
const publishWritingP2 = css(p14Regular, { color: cssVar('textSubdued') });

// ==============================================
// Types
// ==============================================

export interface NotebookPublishTabProps {
  readonly notebookId: string;
  readonly isAdmin: boolean;
  readonly publishingState: Publish_State;
  readonly isPremium: boolean;
  readonly publishedVersionState: PublishedVersionState;
  readonly link: string;
  readonly currentSnapshot:
    | {
        createdAt?: string;
        updatedAt?: string;
        snapshotName?: string;
      }
    | undefined;
  readonly onUpdatePublish: NotebookMetaActionsReturn['onUpdatePublishState'];
  readonly onPublish: NotebookMetaActionsReturn['onPublishNotebook'];
}

// ==============================================
// React Util components
// ==============================================

export const RequiresUpgrade: FC = () => (
  <div css={requiresUpgradeStyles}>Requires Upgrade</div>
);

export const PublishingWriting: FC = () => (
  <div css={innerPopUpStyles}>
    <div css={groupStyles}>
      <div css={titleAndToggleStyles}>
        <div css={titleStyles}>
          <p css={publishWritingP}>Publish Online</p>
          <p css={publishWritingP2}>
            Create a public URL and manage some settings to share your work.{' '}
            <Link
              color="plain"
              href="https://app.decipad.com/docs/share/publish"
            >
              Check out docs
            </Link>
          </p>
        </div>
      </div>
    </div>
  </div>
);

export const PublishedDate: FC<{
  currentSnapshot: NotebookPublishTabProps['currentSnapshot'];
  publishedVersionState: NotebookPublishTabProps['publishedVersionState'];
}> = ({ publishedVersionState, currentSnapshot }) => {
  if (
    currentSnapshot == null ||
    currentSnapshot.createdAt == null ||
    currentSnapshot.updatedAt == null ||
    publishedVersionState == null ||
    publishedVersionState === 'first-time-publish'
  ) {
    return null;
  }

  const date = format(
    new Date(currentSnapshot.updatedAt ?? currentSnapshot.createdAt ?? ''),
    'LLL do, HH:mm'
  );

  return (
    <p css={p13Regular} data-testid="version-date">
      Current published version from {date}
    </p>
  );
};
