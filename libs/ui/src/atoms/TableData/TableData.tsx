import { CellValueType, PlateComponentAttributes } from '@decipad/editor-types';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { ComponentProps, ElementType, FC, HTMLAttributes } from 'react';
import { ConnectDropTarget } from 'react-dnd';
import { useMergedRef } from '../../hooks';
import { CellEditor } from '../../molecules';
import { ConditionalCodeSyntaxError } from '../../molecules/SyntaxErrorHighlight/SyntaxErrorHighlight';
import {
  cssVar,
  Opacity,
  p12Medium,
  p14Medium,
  purple100,
  setCssVar,
  transparency,
} from '../../primitives';
import { table } from '../../styles';
import { tableRowCounter } from '../../utils';

const lineNumberWidth = '22px';

const tdBaseStyles = css(p14Medium, {
  alignItems: 'center',

  background: cssVar('backgroundColor'),

  minHeight: table.tdMinHeight,
  minWidth: table.tdMinWidth,
  maxWidth: table.tdMaxWidth,
  whiteSpace: 'break-spaces',
  cursor: 'default',
  verticalAlign: 'middle',
  paddingTop: table.tdVerticalPadding,
  paddingBottom: table.tdVerticalPadding,
});

const tdPlaceholderStyles = css({
  // Show line numbers on the first cell of each row.
  position: 'relative',
  minWidth: '0',

  '&:first-of-type': {
    paddingLeft: '34px',
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

const liveResultOpacity: Opacity = 0.4;

const liveResultStyles = css({
  background: transparency(purple100, liveResultOpacity).rgba,
});

const selectedStyles = css({
  backgroundColor: cssVar('tableSelectionBackgroundColor'),
});

const focusedStyles = css({
  boxShadow: `0 0 0 2px ${cssVar('tableFocusColor')} inset`,
});

export interface TableDataProps extends HTMLAttributes<HTMLDivElement> {
  as?: ElementType;
  alignRight?: boolean;
  isEditable?: boolean;
  isUserContent?: boolean;
  isLiveResult?: boolean;
  contentEditable?: boolean;
  attributes?: PlateComponentAttributes;
  showPlaceholder?: boolean;
  grabbing?: boolean;
  selected?: boolean;
  focused?: boolean;
  collapsed?: boolean;
  disabled?: boolean;
  type?: CellValueType;
  value?: string;
  onChangeValue?: ComponentProps<typeof CellEditor>['onChangeValue'];
  unit?: string;
  dropTarget?: ConnectDropTarget;
  parseError?: string;
  lastBeforeMoreRowsHidden?: boolean;
}

export const TableData = ({
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
  disabled = false,
  dropTarget,
  lastBeforeMoreRowsHidden = false,
  type,
  unit,
  value,
  onChangeValue = noop,
  alignRight,
  children,
  parseError,
  ...props
}: TableDataProps): ReturnType<FC> => {
  const existingRef =
    attributes && 'ref' in attributes ? attributes.ref : undefined;
  const tdRef = useMergedRef(existingRef, dropTarget);
  const additionalProps = isEditable ? {} : { contentEditable: false };

  return (
    <Component
      {...attributes}
      {...additionalProps}
      ref={tdRef}
      css={[
        isUserContent && editableStyles,
        tdBaseStyles,
        tdGridStyles,
        showPlaceholder && tdPlaceholderStyles,
        disabled && tdDisabledStyles,
        selected && selectedStyles,
        focused && focusedStyles,
        alignRight && alignRightStyles,
        isLiveResult && liveResultStyles,
      ]}
      {...props}
    >
      <CellEditor
        focused={focused}
        type={type}
        value={value}
        unit={unit}
        onChangeValue={onChangeValue}
      >
        <ConditionalCodeSyntaxError error={parseError}>
          {children}
        </ConditionalCodeSyntaxError>
      </CellEditor>
    </Component>
  );
};
