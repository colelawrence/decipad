import { FC, useCallback } from 'react';
import { CodeResult, DataViewTableHeader, useEventNoEffect } from '@decipad/ui';
import { Result, SerializedType } from '@decipad/computer';
import { Folder, FolderOpen } from 'libs/ui/src/icons';
import { css } from '@emotion/react';
import { useTEditorRef } from '@decipad/editor-types';
import { deselect } from '@udecode/plate';
import { ValueCell } from '../../types';

const iconStyles = css({
  height: '24px',
  width: '24px',
});

interface DataViewTableHeaderProps {
  type?: SerializedType;
  value?: ValueCell;
  rowSpan?: number;
  colSpan?: number;
  collapsible?: boolean;
  onHover: (hover: boolean) => void;
  hover: boolean;
  alignRight?: boolean;
  collapsedGroups: string[] | undefined;
  onChangeCollapsedGroups: (collapsedGroups: string[]) => void;
  groupId: string;
  global?: boolean;
}

export const DataViewHeader: FC<DataViewTableHeaderProps> = ({
  type,
  value,
  rowSpan = 1,
  colSpan = 1,
  onHover,
  hover,
  alignRight,
  collapsedGroups = [],
  onChangeCollapsedGroups,
  groupId,
  collapsible,
  global,
}) => {
  const editor = useTEditorRef();
  const handleCollapseGroupButtonPress = useEventNoEffect(
    useCallback((): void => {
      const { selection } = editor;
      if (selection) {
        deselect(editor);
      }
      const matchingGroupIndex = collapsedGroups.indexOf(groupId);

      if (matchingGroupIndex !== -1) {
        return onChangeCollapsedGroups(
          collapsedGroups.filter((id) => id !== groupId)
        );
      }

      return onChangeCollapsedGroups([...collapsedGroups, groupId]);
    }, [collapsedGroups, editor, groupId, onChangeCollapsedGroups])
  );

  if (type == null || value == null) {
    return null;
  }

  const groupIsCollapsed = collapsedGroups.includes(groupId);

  const resultWrapperStyles = css({
    display: 'inline-flex',
    flexDirection: 'row',
    alignItems: 'center',
    fontWeight: '700',
    justifyContent: 'inherit',
    cursor: 'pointer',
    '&:hover': {
      opacity: 0.5,
    },
  });

  return (
    <DataViewTableHeader
      hover={hover}
      rowSpan={rowSpan}
      colSpan={groupIsCollapsed ? 1 : colSpan}
      onHover={onHover}
      alignRight={alignRight}
      global={global}
    >
      {collapsible ? (
        <div onClick={handleCollapseGroupButtonPress} css={resultWrapperStyles}>
          <CodeResult
            value={value as Result.Result['value']}
            variant="inline"
            type={type}
          />
          <span css={iconStyles}>
            {groupIsCollapsed ? <Folder /> : <FolderOpen />}
          </span>
        </div>
      ) : (
        <CodeResult
          value={value as Result.Result['value']}
          variant="inline"
          type={type}
        />
      )}
    </DataViewTableHeader>
  );
};
