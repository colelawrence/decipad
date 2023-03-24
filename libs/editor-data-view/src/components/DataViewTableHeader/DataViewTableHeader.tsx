import { FC, useCallback } from 'react';
import {
  CodeResult,
  DataViewTableHeader as DataViewTableHeaderUI,
  useEventNoEffect,
} from '@decipad/ui';
import { Result, SerializedType } from '@decipad/computer';
import { Folder, FolderOpen } from 'libs/ui/src/icons';
import { css } from '@emotion/react';
import { AnyElement, useTEditorRef } from '@decipad/editor-types';
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
  expandedGroups: string[] | undefined;
  onChangeExpandedGroups: (collapsedGroups: string[]) => void;
  groupId: string;
  global?: boolean;
  rotate: boolean;
  isFirstLevelHeader: boolean;
  element?: AnyElement;
}

export const DataViewTableHeader: FC<DataViewTableHeaderProps> = ({
  type,
  value,
  rowSpan = 1,
  colSpan = 1,
  onHover,
  hover,
  alignRight,
  expandedGroups = [],
  onChangeExpandedGroups,
  groupId,
  collapsible,
  global,
  element,
  rotate,
  isFirstLevelHeader,
}) => {
  const editor = useTEditorRef();
  const handleCollapseGroupButtonPress = useEventNoEffect(
    useCallback((): void => {
      const { selection } = editor;
      if (selection) {
        deselect(editor);
      }
      const matchingGroupIndex = expandedGroups.indexOf(groupId);

      if (matchingGroupIndex !== -1) {
        return onChangeExpandedGroups(
          expandedGroups.filter((id) => id !== groupId)
        );
      }

      return onChangeExpandedGroups([...expandedGroups, groupId]);
    }, [expandedGroups, editor, groupId, onChangeExpandedGroups])
  );

  if (type == null || value == null) {
    return null;
  }

  const groupIsExpanded = !collapsible || expandedGroups.includes(groupId);

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
    <DataViewTableHeaderUI
      hover={hover}
      rowSpan={rowSpan}
      colSpan={groupIsExpanded ? colSpan : 1}
      onHover={onHover}
      alignRight={alignRight}
      global={global}
      rotate={rotate}
      isFirstLevelHeader={isFirstLevelHeader}
    >
      {collapsible ? (
        <div onClick={handleCollapseGroupButtonPress} css={resultWrapperStyles}>
          <>
            {value != null && (
              <CodeResult
                value={value as Result.Result['value']}
                variant="inline"
                type={type}
                element={element}
              />
            )}
            <span css={iconStyles} data-test-id="data-view-row-expander">
              {groupIsExpanded ? <FolderOpen /> : <Folder />}
            </span>
          </>
        </div>
      ) : (
        <CodeResult
          value={value as Result.Result['value']}
          variant="inline"
          type={type}
          element={element}
        />
      )}
    </DataViewTableHeaderUI>
  );
};
