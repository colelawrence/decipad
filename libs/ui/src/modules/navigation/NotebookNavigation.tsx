import { FC, useEffect } from 'react';
import { useDrag as useCustomDrag, useDragLayer, XYCoord } from 'react-dnd';
import { PermissionType } from '@decipad/graphql-client';
import { UserIconKey } from '@decipad/editor-types';
import { NotebookNavigationProps } from './types';
import * as Styled from './styles';
import { Sheet, Ellipsis } from '../../icons';
import { NotebookOptions } from '../topbar';
import {
  Anchor,
  DNDItemTypes,
  AvailableSwatchColor,
  getEmptyImage,
} from '../../utils';
import { cssVar } from '../../primitives';
import { css } from '@emotion/react';

interface DropResult {
  id: string;
  title: string;
  icon: UserIconKey;
  color: AvailableSwatchColor;
}

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

  const renderItem = () => {
    switch (itemType) {
      case DNDItemTypes.ICON:
        return (
          <Styled.DragDropWrapper>
            <Styled.DragDropIcon>
              <Sheet />
            </Styled.DragDropIcon>
            <Styled.DragDropTitle>{item.title}</Styled.DragDropTitle>
          </Styled.DragDropWrapper>
        );
      default:
        return null;
    }
  };

  if (!isDragging) {
    return null;
  }

  const dragLayerStyles = getDragLayerStyles(
    initialOffset,
    currentOffset,
    mousePosition,
    isDragging
  );

  return <div css={dragLayerStyles}>{renderItem()}</div>;
}

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

export const NotebookNavigation: FC<NotebookNavigationProps> = ({
  workspaceId,
  currentNotebookId,
  workspaces,
  actions,
  notebook,
  onDuplicate,
  href,
  sections,
}) => {
  const { id, name, myPermissionType, archived, createdAt } = notebook;

  const [{ isDragging }, drag, preview] = useCustomDrag(
    () => ({
      type: DNDItemTypes.ICON,
      item: {
        id,
        title: name,
        icon: <Sheet />,
        color: cssVar('backgroundDefault'),
      },
      end: (item, monitor) => {
        const dropResult = monitor.getDropResult<DropResult>();
        if (item && dropResult) {
          actions.onMoveToSection(item.id, dropResult.id);
        }
      },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
        handlerId: monitor.getHandlerId(),
      }),
    }),
    [id, name, actions.onMoveToSection]
  );

  useEffect(() => {
    const img = getEmptyImage();
    img.setAttribute('hidden', 'true');
    preview(img, {
      captureDraggingState: true,
    });
  }, [preview]);

  return (
    <>
      {isDragging ? <CustomDragLayer /> : null}
      <Styled.NotebookWrapper
        ref={drag}
        className="dragitem"
        key={`notebook-item-${id}`}
        isSelected={id === currentNotebookId}
      >
        <Anchor href={href}>
          <Styled.ItemWrapper
            marginLeft={sections && sections.length > 0 ? 22 : undefined}
          >
            <Styled.IconWrapper>
              <Sheet />
            </Styled.IconWrapper>
            <Styled.TextWrapper
              isSelected={id === currentNotebookId}
              isNested={!!sections && sections.length > 0}
            >
              {name}
            </Styled.TextWrapper>
          </Styled.ItemWrapper>
        </Anchor>
        <Styled.NotebookOptionsWrapper>
          {id === currentNotebookId && (
            <NotebookOptions
              permissionType={myPermissionType as PermissionType}
              onDuplicate={onDuplicate}
              trigger={
                <Styled.EllipsisWrapper data-testid="list-notebook-options">
                  <Ellipsis />
                </Styled.EllipsisWrapper>
              }
              workspaces={workspaces}
              notebookId={id}
              creationDate={new Date(createdAt)}
              isArchived={!!archived}
              actions={actions}
              workspaceId={workspaceId ?? ''}
            />
          )}
        </Styled.NotebookOptionsWrapper>
      </Styled.NotebookWrapper>
    </>
  );
};
