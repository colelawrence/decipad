import { isFlagEnabled } from '@decipad/feature-flags';
import { notebooks } from '@decipad/routing';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import format from 'date-fns/format';
import { FC, useState } from 'react';
import {
  ColorStatusCircle,
  Divider,
  Dot,
  MenuItem,
  TriggerMenuItem,
} from '../../atoms';
import {
  AvailableColorStatus,
  statusColors,
  TColorStatus,
} from '../../atoms/ColorStatus/ColorStatus';
import * as icons from '../../icons';
import { MenuList } from '../../molecules';
import {
  cssVar,
  offBlack,
  p12Medium,
  p14Medium,
  setCssVar,
  shortAnimationDuration,
  transparency,
} from '../../primitives';
import { notebookList } from '../../styles';
import { mainIconButtonStyles } from '../../styles/buttons';
import {
  Anchor,
  AvailableSwatchColor,
  baseSwatches,
  UserIconKey,
} from '../../utils';

type NotebookListItemProps = {
  readonly id: string;
  readonly name: string;
  readonly creationDate?: Date;
  readonly archivePage?: boolean;

  readonly actionsOpen?: boolean;
  readonly onExport?: () => void;
  readonly toggleActionsOpen?: () => void;
  readonly onDuplicate?: () => void;
  readonly onDelete?: () => void;
  readonly onChangeStatus?: (status: TColorStatus) => void;
  readonly onMoveToWorkspace?: (workspaceId: string) => void;
  readonly onUnarchive?: () => void;
  readonly icon: UserIconKey;
  readonly iconColor: AvailableSwatchColor;
  readonly status: TColorStatus;
  readonly otherWorkspaces?: { id: string; name: string }[];
};

export const NotebookListItem = ({
  id,
  name,
  status,
  creationDate,
  actionsOpen = false,
  toggleActionsOpen = noop,
  onDuplicate = noop,
  onMoveToWorkspace = noop,
  onDelete = noop,
  onExport = noop,
  onUnarchive = noop,
  onChangeStatus = noop,
  icon = 'Rocket',
  iconColor = 'Sulu',
  archivePage,
  otherWorkspaces,
}: NotebookListItemProps): ReturnType<FC> => {
  const Icon = icons[icon];

  const href = notebooks({}).notebook({ notebook: { id, name } }).$;
  const [feStatus, setFeStatus] = useState<TColorStatus>(status);

  return (
    <div css={wrapperStyles}>
      <Anchor href={href} css={anchorStyles}>
        <Dot
          left={26}
          top={12}
          visible={feStatus !== 'No Status'}
          color={statusColors[feStatus]}
        >
          <div
            css={[iconStyles, { backgroundColor: baseSwatches[iconColor].rgb }]}
          >
            <Icon />
          </div>
        </Dot>
        <strong css={[nameStyles, name || noNameNameStyles]}>
          {name || 'My notebook title'}
        </strong>
        <div css={[menuActionsStyles]}>
          <MenuList
            root
            dropdown
            align="end"
            side="bottom"
            sideOffset={10}
            open={actionsOpen}
            onChangeOpen={toggleActionsOpen}
            trigger={
              <div css={[mainIconButtonStyles, { borderRadius: '6px' }]}>
                <span
                  css={{
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: '16px',
                    minHeight: '16px',
                    maxWidth: '32px',
                    maxHeight: '32px',
                    padding: '20%',
                  }}
                >
                  <icons.Ellipsis />
                </span>
              </div>
            }
          >
            <MenuItem
              icon={<icons.Copy />}
              onSelect={() => {
                onDuplicate();
                toggleActionsOpen();
              }}
            >
              <div css={{ minWidth: '132px' }}>Duplicate</div>
            </MenuItem>
            {otherWorkspaces?.length !== 0 ? (
              <MenuList
                itemTrigger={
                  <TriggerMenuItem icon={<icons.Switch />}>
                    <div css={{ minWidth: '132px' }}>Move to workspace</div>
                  </TriggerMenuItem>
                }
              >
                {otherWorkspaces?.map((workspace) => (
                  <MenuItem
                    key={workspace.id}
                    icon={<icons.AddToWorkspace />}
                    onSelect={() => onMoveToWorkspace(workspace.id)}
                  >
                    {workspace.name}
                  </MenuItem>
                ))}
              </MenuList>
            ) : null}
            <MenuItem
              icon={<icons.Download />}
              onSelect={() => {
                onExport();
                toggleActionsOpen();
              }}
            >
              Download
            </MenuItem>
            {archivePage ? (
              <MenuItem
                icon={<icons.FolderOpen />}
                onSelect={() => {
                  onUnarchive();
                  toggleActionsOpen();
                }}
              >
                Put back
              </MenuItem>
            ) : null}
            <MenuItem
              icon={archivePage ? <icons.Trash /> : <icons.Archive />}
              onSelect={() => {
                onDelete();
                toggleActionsOpen();
              }}
            >
              {archivePage ? 'Delete' : 'Archive'}
            </MenuItem>
            {isFlagEnabled('DASHBOARD_STATUS')
              ? [
                  <li css={menuActionHRStyles} key="divider">
                    <Divider />
                  </li>,
                  AvailableColorStatus.map((label) => (
                    <MenuItem
                      key={label}
                      icon={<ColorStatusCircle name={label} />}
                      onSelect={() => {
                        onChangeStatus(label);
                        setFeStatus(label);
                        toggleActionsOpen();
                      }}
                      selected={feStatus === label}
                    >
                      <span>{label}</span>
                    </MenuItem>
                  )),
                ]
              : null}
            {creationDate && (
              <li css={creationDateStyles}>
                <span css={calendarIconStyles}>
                  <icons.Calendar />
                </span>
                <span> Created: {format(creationDate, 'd MMM Y')}</span>
              </li>
            )}
          </MenuList>
        </div>
      </Anchor>
    </div>
  );
};

const menuActionHRStyles = css(p14Medium, {
  display: 'grid',
  borderRadius: '8px',
  '&:hover': {
    backgroundColor: cssVar('highlightColor'),
  },
  '& button, & a button': {
    ...p14Medium,
    padding: '6px',
    lineHeight: '20px',
  },
  margin: '4px 0',
});

const { gridStyles } = notebookList;

const wrapperStyles = css({
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
  ...setCssVar('currentTextColor', cssVar('iconColorDark')),

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

const menuActionsStyles = css({
  gridArea: 'actions',

  display: 'grid',
  gridTemplateRows: '28px',

  transition: `opacity ${shortAnimationDuration} ease-out`,

  ...setCssVar('currentTextColor', cssVar('strongTextColor')),

  position: 'relative',
  opacity: 1,
});

const calendarIconStyles = css({
  display: 'inline-block',
  width: '16px',
  height: '13px',
  opacity: 0.5,
});

const creationDateStyles = css(p12Medium, {
  paddingTop: '8px',
  lineHeight: '20px',
  backgroundColor: cssVar('highlightColor'),
  border: `1px solid ${cssVar('strongHighlightColor')}`,
  color: cssVar('weakTextColor'),
  margin: '-7px',
  borderRadius: '0 0 8px 8px',
  padding: '4px 8px',
  listStyle: 'none',
  marginTop: '4px',
});
