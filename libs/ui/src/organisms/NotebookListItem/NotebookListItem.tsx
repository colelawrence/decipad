import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC } from 'react';
import { IconButton } from '../../atoms';
import { Ellipsis, Table } from '../../icons';
import { NotebookListItemActions } from '../../molecules';
import {
  black,
  cssVar,
  p13Regular,
  p14Medium,
  setCssVar,
  shortAnimationDuration,
  transparency,
} from '../../primitives';
import { notebookList } from '../../styles';
import { Anchor } from '../../utils';

const { gridStyles } = notebookList;
const styles = css(gridStyles, {
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
  gridTemplateColumns: '14px',
  justifyContent: 'center',
  alignContent: 'center',

  border: `1px solid ${cssVar('strongHighlightColor')}`,
  borderRadius: '4px',
  backgroundColor: cssVar('backgroundColor'),
  ...setCssVar('currentTextColor', cssVar('strongTextColor')),

  boxShadow: `0px 2px 24px -4px ${transparency(black, 0.08).rgba}`,
});
const nameStyles = css({
  gridArea: 'title',
  gridColumnEnd: 'emptycol',
  alignSelf: 'end',

  overflowX: 'clip',
  '@supports not (overflow-x: clip)': {
    overflowX: 'hidden',
  },
  textOverflow: 'ellipsis',

  ...p14Medium,
  ...setCssVar('currentTextColor', cssVar('strongTextColor')),
});
const noDescriptionNameStyles = css({
  gridRowEnd: 'description',
  alignSelf: 'center',
});
const noNameNameStyles = css({
  ...setCssVar('currentTextColor', cssVar('weakTextColor')),
});
const descriptionStyles = css(p13Regular, {
  gridArea: 'description',
  gridColumnEnd: 'emptycol',
  alignSelf: 'start',

  overflowX: 'clip',
  '@supports not (overflow-x: clip)': {
    overflowX: 'hidden',
  },
  textOverflow: 'ellipsis',
});
const actionsStyles = css({
  gridArea: 'actions',

  display: 'grid',
  gridTemplateRows: '28px',

  transition: `opacity ${shortAnimationDuration} ease-out`,

  ...setCssVar('currentTextColor', cssVar('strongTextColor')),
});

interface NotebookListItemProps {
  readonly name: string;
  readonly description?: string;

  readonly href: string;
  readonly exportHref: string;
  readonly exportFileName: string;

  readonly actionsOpen?: boolean;
  readonly toggleActionsOpen?: () => void;
  readonly onDuplicate?: () => void;
  readonly onDelete?: () => void;
}
export const NotebookListItem = ({
  name,
  description,
  href,
  exportHref,
  exportFileName,
  actionsOpen = false,
  toggleActionsOpen = noop,
  onDuplicate = noop,
  onDelete = noop,
}: NotebookListItemProps): ReturnType<FC> => {
  return (
    <div css={{ position: 'relative' }}>
      <Anchor href={href} css={styles}>
        <div css={iconStyles}>
          <span>
            <Table />
          </span>
        </div>
        <strong
          css={[
            nameStyles,
            name || noNameNameStyles,
            description || noDescriptionNameStyles,
          ]}
        >
          {name || 'My notebook title'}
        </strong>
        <div css={descriptionStyles}>{description}</div>
        <div
          css={[
            actionsStyles,
            { position: 'relative', opacity: 1 },
            actionsOpen || {
              '@media (pointer: fine)': {
                '*:not(:hover):not(:focus) > &': { opacity: 0 },
              },
            },
          ]}
        >
          <IconButton roundedSquare onClick={toggleActionsOpen}>
            <Ellipsis />
          </IconButton>
        </div>
      </Anchor>
      {actionsOpen && (
        <div
          css={{
            position: 'absolute',
            top: 'calc(100% - 12px)',
            right: 0,
            width: '156px',
          }}
        >
          <NotebookListItemActions
            href={href}
            exportHref={exportHref}
            exportFileName={exportFileName}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
          />
        </div>
      )}
    </div>
  );
};
