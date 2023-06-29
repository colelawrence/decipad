/* eslint decipad/css-prop-named-variable: 0 */
import {
  AnyElement,
  CellValueType,
  PlateComponentAttributes,
} from '@decipad/editor-types';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import {
  ComponentProps,
  ElementType,
  FC,
  HTMLAttributes,
  ReactNode,
  forwardRef,
} from 'react';
import { ConnectDropTarget } from 'react-dnd';
import { useMergedRef } from '../../hooks';
import { CellEditor, SyntaxErrorHighlight } from '../../molecules';
import { cssVar, p12Medium, setCssVar } from '../../primitives';
import { table } from '../../styles';
import { tdBaseStyles } from '../../styles/table';
import { tableRowCounter } from '../../utils';
import { ColumnDropLine } from '../DropLine/ColumnDropLine';

const lineNumberWidth = '22px';

const tdPlaceholderStyles = css({
  // Show line numbers on the first cell of each row.
  position: 'relative',
  minWidth: '0',

  '&:first-of-type': {
    paddingLeft: table.firstTdPaddingLeft,
  },

  '&:first-of-type::before': {
    ...setCssVar('normalTextColor', cssVar('weakTextColor')),
    ...p12Medium,
    backgroundColor: 'transparent',

    counterIncrement: tableRowCounter,
    content: `counter(${tableRowCounter})`,

    position: 'absolute',
    right: `calc(100% - ${lineNumberWidth})`,
    top: '50%',
    transform: 'translateY(-50%)',
    fontVariantNumeric: 'tabular-nums',
    userSelect: 'none',
  },
});

const tdGridStyles = {};

const editableStyles = css({
  paddingLeft: '12px',
  paddingRight: '12px',
});

const tdDisabledStyles = css({
  ...setCssVar('normalTextColor', cssVar('weakerTextColor')),
});

const alignRightStyles = css({
  textAlign: 'right',
});

const selectedStyles = css({
  backgroundColor: cssVar('tableSelectionBackgroundColor'),
});

const focusedStyles = css({
  boxShadow: `0 0 0 2px ${cssVar('tableFocusColor')} inset`,
});

const draggableStyles = css({
  ':hover': {
    '.drag-handle': {
      display: 'block',
    },
  },
});

const nonContentEditableStyles = css({
  whiteSpace: 'nowrap',
});

export interface TableDataProps extends HTMLAttributes<HTMLDivElement> {
  as?: ElementType;
  alignRight?: boolean;
  isEditable?: boolean;
  isUserContent?: boolean;
  isLiveResult?: boolean;
  attributes?: PlateComponentAttributes;
  showPlaceholder?: boolean;
  grabbing?: boolean;
  selected?: boolean;
  focused?: boolean;
  collapsed?: boolean;
  disabled?: boolean;
  type?: CellValueType;
  rowSpan?: number;
  value?: string;
  onChangeValue?: ComponentProps<typeof CellEditor>['onChangeValue'];
  unit?: string;
  dropTarget?: ConnectDropTarget;
  dropDirection?: 'left' | 'right';
  parseError?: string;
  firstChildren?: ReactNode;
  dropdownOptions?: Pick<
    ComponentProps<typeof CellEditor>,
    'dropdownOptions' | 'dropdownResult'
  >;
  element?: AnyElement;
}

export const TableData = forwardRef(
  (
    {
      as: Component = 'div',
      isEditable = false,
      isUserContent = false,
      isLiveResult = false,
      attributes,
      showPlaceholder = true,
      draggable,
      grabbing,
      selected,
      focused,
      collapsed,
      dropTarget,
      rowSpan,
      disabled = false,
      type,
      unit,
      value,
      onChangeValue = noop,
      alignRight,
      children,
      parseError,
      firstChildren,
      dropDirection,
      dropdownOptions,
      element,
      ...props
    }: TableDataProps,
    ref
  ): ReturnType<FC> => {
    const existingRef =
      attributes && 'ref' in attributes ? attributes.ref : undefined;
    const tdRef = useMergedRef(existingRef, ref, dropTarget);
    const additionalProps = isEditable ? {} : { contentEditable: false };

    return (
      <Component
        {...attributes}
        {...additionalProps}
        ref={tdRef}
        rowSpan={rowSpan}
        css={[
          isUserContent && editableStyles,
          tdBaseStyles,
          tdGridStyles,
          showPlaceholder && tdPlaceholderStyles,
          disabled && tdDisabledStyles,
          selected && selectedStyles,
          focused && focusedStyles,
          alignRight && alignRightStyles,
          draggable && draggableStyles,
          !isEditable && nonContentEditableStyles,
        ]}
        {...props}
      >
        {firstChildren}

        <CellEditor
          focused={focused}
          isEditable={isEditable}
          type={type}
          value={value}
          unit={unit}
          onChangeValue={onChangeValue}
          parentType="table"
          element={element}
          {...dropdownOptions}
        >
          {/* Retain DOM structure for error highlighting
     To avoid jumping cursor when an error is fixed or caused around it.
     This keeps happening. Please do not undo. */}
          <SyntaxErrorHighlight
            variant="custom"
            error={parseError}
            hideError={!parseError}
          >
            {dropDirection === 'left' && (
              <ColumnDropLine dropDirection={dropDirection} />
            )}
            {children}
            {dropDirection === 'right' && (
              <ColumnDropLine dropDirection={dropDirection} />
            )}
          </SyntaxErrorHighlight>
        </CellEditor>
      </Component>
    );
  }
);
