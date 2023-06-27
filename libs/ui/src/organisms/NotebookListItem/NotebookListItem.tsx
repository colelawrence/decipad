/* eslint decipad/css-prop-named-variable: 0 */
import { useThemeFromStore } from '@decipad/react-contexts';
import { notebooks } from '@decipad/routing';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import format from 'date-fns/format';
import { FC, useEffect, useState } from 'react';
import { XYCoord, useDrag, useDragLayer } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { ColorStatusCircle, MenuItem, TriggerMenuItem } from '../../atoms';
import * as icons from '../../icons';
import { FilterBubbles, MenuList, NotebookIcon } from '../../molecules';
import {
  cssVar,
  p12Medium,
  p14Medium,
  setCssVar,
  shortAnimationDuration,
  smallestDesktop,
} from '../../primitives';
import { notebookList } from '../../styles';
import { mainIconButtonStyles } from '../../styles/buttons';
import {
  Anchor,
  AvailableColorStatus,
  AvailableSwatchColor,
  ColorStatusNames,
  DNDItemTypes,
  TColorStatus,
  UserIconKey,
  swatchesThemed,
} from '../../utils';
import { Section } from '../WorkspaceNavigation/WorkspaceNavigation';

type PageInfo = {
  type: 'archived' | 'shared' | 'section' | 'workspace';
  sections: Section[];
};

function CustomDragLayer() {
  const {
    itemType,
    isDragging,
    item,
    initialOffset,
    mousePosition,
    currentOffset,
  } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getInitialClientOffset(),
    mousePosition: monitor.getDifferenceFromInitialOffset(),
    isDragging: monitor.isDragging(),
  }));
  const [darkTheme] = useThemeFromStore();
  const baseSwatches = swatchesThemed(darkTheme);

  const renderItem = () => {
    const color = baseSwatches[item.color as AvailableSwatchColor];
    const Icon = icons[item.icon as UserIconKey];

    switch (itemType) {
      case DNDItemTypes.ICON:
        return (
          <div
            style={{
              backgroundColor: color.hex,
              opacity: 1,
              color: cssVar('currentTextColor'),
              padding: 6,
              borderRadius: 6,
              display: 'inline-flex',
              gap: 4,
              zIndex: 1000,
              transform: 'rotate(3deg)',
            }}
          >
            <span
              css={{
                height: 16,
                width: 16,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon />
            </span>
            <span css={{ alignItems: 'center', justifyContent: 'center' }}>
              {item.title}
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  if (!isDragging) {
    return null;
  }

  return (
    <div
      css={getDragLayerStyles(
        initialOffset,
        currentOffset,
        mousePosition,
        isDragging
      )}
    >
      {renderItem()}
    </div>
  );
}

type NotebookListItemProps = {
  readonly id: string;
  readonly name: string;
  readonly creationDate?: Date;
  readonly page?: PageInfo;
  readonly isPublic?: boolean;
  readonly section?: Section;
  readonly actionsOpen?: boolean;
  readonly onExport?: () => void;
  readonly onExportBackups?: () => void;
  readonly toggleActionsOpen?: () => void;
  readonly onDuplicate?: () => void;
  readonly onDelete?: () => void;
  readonly onMoveToSection?: (padId: string, sectionId: string) => void;
  readonly onChangeStatus?: (status: TColorStatus) => void;
  readonly onMoveToWorkspace?: (workspaceId: string) => void;
  readonly onUnarchive?: () => void;
  readonly icon: UserIconKey;
  readonly iconColor: AvailableSwatchColor;
  readonly status: TColorStatus;
  readonly otherWorkspaces?: { id: string; name: string }[];
};

interface DropResult {
  id: string;
  title: string;
  icon: UserIconKey;
  color: AvailableSwatchColor;
}

export const NotebookListItem = ({
  id,
  name,
  status,
  creationDate,
  isPublic,
  section,
  actionsOpen = false,
  toggleActionsOpen = noop,
  onDuplicate = noop,
  onMoveToWorkspace = noop,
  onMoveToSection = noop,
  onDelete = noop,
  onExport = noop,
  onExportBackups = noop,
  onUnarchive = noop,
  onChangeStatus = noop,
  icon = 'Rocket',
  iconColor = 'Sulu',
  page,
  otherWorkspaces,
}: NotebookListItemProps): ReturnType<FC> => {
  const href = notebooks({}).notebook({ notebook: { id, name } }).$;
  const [feStatus, setFeStatus] = useState<TColorStatus>(status);
  const [statusOpen, setStatusOpen] = useState(false);
  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: DNDItemTypes.ICON,
      item: { id, title: name, icon, color: iconColor },
      end: (item, monitor) => {
        const dropResult = monitor.getDropResult<DropResult>();
        if (item && dropResult) {
          onMoveToSection(item.id, dropResult.id);
        }
      },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
        handlerId: monitor.getHandlerId(),
      }),
    }),
    [id, name, icon, iconColor, onMoveToSection]
  );

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  const canArchive = page?.type !== 'shared';
  const canMoveToWorkspace =
    page?.type !== 'shared' &&
    otherWorkspaces != null &&
    otherWorkspaces.length > 0;

  return (
    <>
      {isDragging ? <CustomDragLayer /> : null}
      <div
        ref={drag}
        className="dragitem"
        css={[wrapperStyles, isDragging && notebookIconGrabbingStyles]}
        data-testid="notebook-list-item"
      >
        <Anchor href={href} css={anchorStyles}>
          <NotebookIcon color={iconColor} icon={icon} />

          <strong
            data-testid="list-notebook-title"
            css={[nameStyles, name || noNameNameStyles]}
          >
            {name || 'My notebook'}
          </strong>
          <div css={notebookListTagsStyles}>
            <span css={notebookListInlineTags}>
              <MenuList
                root
                dropdown
                align="end"
                side="bottom"
                sideOffset={10}
                open={statusOpen}
                onChangeOpen={setStatusOpen}
                trigger={
                  <div>
                    <FilterBubbles
                      description={ColorStatusNames[feStatus]}
                      iconStyles={css({ transform: 'translateY(1px)' })}
                      icon={<ColorStatusCircle name={feStatus} />}
                    />
                  </div>
                }
              >
                {AvailableColorStatus.map((label) => (
                  <MenuItem
                    key={label}
                    icon={<ColorStatusCircle name={label} />}
                    onSelect={() => {
                      onChangeStatus(label as TColorStatus);
                      setFeStatus(label);
                      setStatusOpen(!statusOpen);
                    }}
                    selected={feStatus === label}
                  >
                    <span>{ColorStatusNames[label]}</span>
                  </MenuItem>
                ))}
              </MenuList>

              {isPublic ? (
                <FilterBubbles description="Published" icon={<icons.Globe />} />
              ) : null}

              {section?.name ? (
                <FilterBubbles
                  description={section.name}
                  icon={<icons.Folder />}
                />
              ) : null}

              {page?.type === 'archived' ? (
                <FilterBubbles description="Archive" icon={<icons.Archive />} />
              ) : null}
            </span>
          </div>
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
              {canMoveToWorkspace ? (
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
              <MenuItem
                icon={<icons.GitBranch />}
                onSelect={() => {
                  onExportBackups();
                  toggleActionsOpen();
                }}
              >
                Version History
              </MenuItem>
              {page?.type === 'archived' ? (
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
              {canArchive && (
                <MenuItem
                  icon={
                    page?.type === 'archived' ? (
                      <icons.Trash />
                    ) : (
                      <icons.Archive />
                    )
                  }
                  onSelect={() => {
                    onDelete();
                    toggleActionsOpen();
                  }}
                >
                  {page?.type === 'archived' ? 'Delete' : 'Archive'}
                </MenuItem>
              )}

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
    </>
  );
};

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

const nameStyles = css({
  gridArea: 'title',
  gridColumnEnd: 'tags',
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

const notebookListInlineTags = css({
  display: 'flex',
  gap: 8,
});

const notebookListTagsStyles = css({
  gridArea: 'tags',
  display: 'grid',
  paddingLeft: 36,
  [`@media (max-width: ${smallestDesktop.landscape.width}px)`]: {
    display: 'none',
  },
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
  border: `1px solid ${cssVar('borderColor')}`,
  color: cssVar('weakTextColor'),
  margin: '-7px',
  borderRadius: '0 0 8px 8px',
  padding: '4px 8px',
  listStyle: 'none',
  marginTop: '4px',
});

const notebookIconGrabbingStyles = css({
  cursor: 'grabbing',
});

function getDragLayerStyles(
  initialOffset: XYCoord | null,
  currentOffset: XYCoord | null,
  mousePosition: XYCoord | null,
  isDragging: boolean
) {
  if (!initialOffset || !currentOffset || !mousePosition) {
    return {
      display: 'none',
    };
  }

  const { x, y } = mousePosition;
  const { x: iX, y: iY } = initialOffset;
  const { x: jX, y: jY } = currentOffset;
  const xDelta = Math.round(jX - iX + x);
  const yDelta = Math.round(jY - iY + y);
  const trailingBy = 5;
  const transform = `translate3d(${xDelta + trailingBy}px, ${
    yDelta + trailingBy
  }px, 0)`;
  return css({
    transform,
    position: 'fixed',
    opacity: isDragging ? 1 : 0,
    height: isDragging ? '' : 0,
    WebkitTransform: transform,
    zIndex: '10',
  });
}
