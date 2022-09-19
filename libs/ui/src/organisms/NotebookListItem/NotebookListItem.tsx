import { notebooks } from '@decipad/routing';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC } from 'react';
import { IconButton } from '../../atoms';
import * as icons from '../../icons';
import { NotebookListItemActions } from '../../molecules';
import {
  offBlack,
  cssVar,
  p14Medium,
  setCssVar,
  shortAnimationDuration,
  transparency,
} from '../../primitives';
import { notebookList } from '../../styles';
import {
  Anchor,
  AvailableSwatchColor,
  baseSwatches,
  UserIconKey,
} from '../../utils';

const { gridStyles } = notebookList;

const wrapperStyles = css({
  // height: '72px',
  position: 'relative',
});

const anchorStyles = css(gridStyles, {
  padding: `16px 0`,
  whiteSpace: 'nowrap',

  clipPath: 'inset(0 -12px 0 -12px round 12px)',
  transition: `background-color ${shortAnimationDuration} ease-out, box-shadow ${shortAnimationDuration} ease-out`,
  ':hover, :focus': {
    backgroundColor: cssVar('highlightColor'),
    boxShadow: `0px 0px 0px 12px ${cssVar('highlightColor')}`,
  },
});

const iconStyles = css({
  gridArea: 'icon',
  height: '38px',

  display: 'grid',
  placeItems: 'center',
  justifyContent: 'center',
  alignContent: 'center',
  gridTemplateColumns: '14px',

  '> svg': {
    height: '18px',
    width: '18px',
  },

  border: `1px solid ${cssVar('strongHighlightColor')}`,
  borderRadius: '4px',
  backgroundColor: cssVar('backgroundColor'),
  ...setCssVar('currentTextColor', cssVar('strongTextColor')),

  boxShadow: `0px 2px 24px -4px ${transparency(offBlack, 0.08).rgba}`,
});

const nameStyles = css({
  gridArea: 'title',
  gridColumnEnd: 'emptycol',
  alignSelf: 'center',

  overflowX: 'clip',
  '@supports not (overflow-x: clip)': {
    overflowX: 'hidden',
  },
  textOverflow: 'ellipsis',

  ...p14Medium,
  ...setCssVar('currentTextColor', cssVar('strongTextColor')),
});

const noNameNameStyles = css({
  ...setCssVar('currentTextColor', cssVar('weakTextColor')),
});

const actionsStyles = css({
  gridArea: 'actions',

  display: 'grid',
  gridTemplateRows: '28px',

  transition: `opacity ${shortAnimationDuration} ease-out`,

  ...setCssVar('currentTextColor', cssVar('strongTextColor')),

  position: 'relative',
  opacity: 1,
});

const actionWrapperStyles = css({
  position: 'absolute',
  top: 'calc(100% - 12px)',
  right: 0,
  width: '156px',
});

type NotebookListItemProps = {
  readonly id: string;
  readonly name: string;

  readonly actionsOpen?: boolean;
  readonly onExport?: () => void;
  readonly toggleActionsOpen?: () => void;
  readonly onDuplicate?: () => void;
  readonly onDelete?: () => void;
  readonly icon: UserIconKey;
  readonly iconColor: AvailableSwatchColor;
};
export const NotebookListItem = ({
  id,
  name,
  actionsOpen = false,
  toggleActionsOpen = noop,
  onDuplicate = noop,
  onDelete = noop,
  onExport = noop,
  icon = 'Rocket',
  iconColor = 'Catskill',
}: NotebookListItemProps): ReturnType<FC> => {
  const Icon = icons[icon];

  const href = notebooks({}).notebook({ notebook: { id, name } }).$;

  return (
    <div css={wrapperStyles}>
      <Anchor href={href} css={anchorStyles}>
        <div
          css={[iconStyles, { backgroundColor: baseSwatches[iconColor].rgb }]}
        >
          <Icon />
        </div>
        <strong css={[nameStyles, name || noNameNameStyles]}>
          {name || 'My notebook title'}
        </strong>
        <div
          css={[
            actionsStyles,
            actionsOpen || {
              '@media (pointer: fine)': {
                '*:not(:hover):not(:focus) > &': { opacity: 0 },
              },
            },
          ]}
        >
          <IconButton roundedSquare onClick={toggleActionsOpen}>
            <icons.Ellipsis />
          </IconButton>
        </div>
      </Anchor>
      {actionsOpen && (
        <div css={actionWrapperStyles}>
          <NotebookListItemActions
            href={href}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
            onExport={onExport}
          />
        </div>
      )}
    </div>
  );
};
