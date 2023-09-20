/* eslint decipad/css-prop-named-variable: 0 */
import { useThemeFromStore } from '@decipad/react-contexts';
import { notebooks } from '@decipad/routing';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { ComponentProps, FC, memo, useCallback, useEffect } from 'react';
import { XYCoord, useDrag as useCustomDrag, useDragLayer } from 'react-dnd';
import * as icons from '../../icons';
import { NotebookIcon, NotebookStatus } from '../../molecules';
import { cssVar, p14Medium, shortAnimationDuration } from '../../primitives';
import { notebookList } from '../../styles';
import { mainIconButtonStyles } from '../../styles/buttons';
import {
  Anchor,
  AvailableSwatchColor,
  DNDItemTypes,
  UserIconKey,
  getEmptyImage,
  swatchesThemed,
} from '../../utils';
import { NotebookStatusProps } from '../../molecules/NotebookStatus/NotebookStatus';
import { NotebookOptions } from './NotebookOptions';
import { Ellipsis } from '../../icons';

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
              color: cssVar('textDefault'),
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
            <span
              css={{
                alignItems: 'center',
                justifyContent: 'center',
                color: cssVar('textTitle'),
              }}
            >
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

export type NotebookListItemProps = Pick<
  ComponentProps<typeof NotebookStatus>,
  'section' | 'isPublic' | 'status'
> &
  Omit<ComponentProps<typeof NotebookOptions>, 'trigger'> & {
    readonly id: string;
    readonly name: string;
    readonly onMoveToSection: (padId: string, sectionId: string) => void;
    readonly onChangeStatus: (
      notebookId: string,
      status: NotebookStatusProps['status']
    ) => void;
    readonly icon: UserIconKey;
    readonly iconColor: AvailableSwatchColor;
    readonly workspaceId: string;
  };

interface DropResult {
  id: string;
  title: string;
  icon: UserIconKey;
  color: AvailableSwatchColor;
}

/**
 * Component needs to re-render a few times when searching for notebooks.
 * Memo prevents most re-renders, and cascades.
 */
export const NotebookListItem: FC<NotebookListItemProps> = memo(
  function NotebookListItem({
    id,
    name,
    status,
    creationDate,
    isPublic,
    isArchived,
    section,
    workspaces,
    onDuplicate,
    onMoveToSection,
    onDelete,
    onExport,
    onExportBackups,
    onUnarchive,
    onMoveWorkspace,
    onChangeStatus = noop,
    icon = 'Deci',
    iconColor = 'Catskill',
    workspaceId,
  }) {
    const href = notebooks({}).notebook({ notebook: { id, name } }).$;
    const [{ isDragging }, drag, preview] = useCustomDrag(
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
      const img = getEmptyImage();
      img.setAttribute('hidden', 'true');
      preview(getEmptyImage(), {
        captureDraggingState: true,
      });
    }, [preview]);

    const changeStatus = useCallback<
      ComponentProps<typeof NotebookStatus>['onChangeStatus']
    >(
      (s) => {
        onChangeStatus(id, s);
      },
      [id, onChangeStatus]
    );

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

            <strong data-testid="list-notebook-title" css={nameStyles}>
              {name || 'My notebook'}
            </strong>
            <NotebookStatus
              status={status}
              isPublic={Boolean(isPublic)}
              onChangeStatus={changeStatus}
              section={section}
              isArchived={isArchived}
            />
            <NotebookOptions
              trigger={
                <div css={mainIconWrapper}>
                  <Ellipsis />
                </div>
              }
              workspaces={workspaces}
              notebookId={id}
              creationDate={creationDate}
              isArchived={isArchived}
              onMoveWorkspace={onMoveWorkspace}
              onDuplicate={onDuplicate}
              onExport={onExport}
              onExportBackups={onExportBackups}
              onUnarchive={onUnarchive}
              onDelete={onDelete}
              allowDuplicate
              workspaceId={workspaceId}
            />
          </Anchor>
        </div>
      </>
    );
  }
);

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
    backgroundColor: cssVar('backgroundDefault'),
    boxShadow: `0px 0px 0px 12px ${cssVar('backgroundDefault')}`,
  },
});

const nameStyles = css(p14Medium, {
  gridArea: 'title',
  gridColumnEnd: 'tags',
  alignSelf: 'center',

  overflowX: 'clip',
  '@supports not (overflow-x: clip)': {
    overflowX: 'hidden',
  },

  color: cssVar('textTitle'),

  maxWidth: '100%',

  overflow: 'hidden',
  whiteSpace: 'normal',
  wordWrap: 'break-word',
  textOverflow: 'ellipsis',
});

const notebookIconGrabbingStyles = css({
  cursor: 'grabbing',
});

const mainIconWrapper = css(mainIconButtonStyles, {
  borderRadius: '6px',
  display: 'flex',
  flexDirection: 'column',
  padding: '20%',
  svg: {
    minWidth: '16px',
    minHeight: '16px',
    maxWidth: '32px',
    maxHeight: '32px',
  },
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
