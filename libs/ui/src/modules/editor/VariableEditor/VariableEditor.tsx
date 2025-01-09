/* eslint decipad/css-prop-named-variable: 0 */
import type { SerializedType } from '@decipad/remote-computer';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { Children, FC, ReactNode, useCallback, useRef, useState } from 'react';
import { DatePickerWrapper, Toggle } from '../../../shared';
import { cssVar, p24Medium, hoverTransitionStyles } from '../../../primitives';
import { AvailableSwatchColor, useSwatchColor } from '../../../utils';
import { ElementVariants } from '@decipad/editor-types';
import { Settings2 } from 'libs/ui/src/icons';
import { useWindowListener } from '@decipad/react-utils';
import { useSelected } from 'slate-react';
import { WidgetWrapper } from '../WidgetWrapper/WidgetWrapper';

const headerWrapperStyles = css({
  position: 'relative',
  display: 'inline-flex',
  gridAutoColumns: 'auto',
  minWidth: 0,
  width: '100%',
  gap: '4px',
});

const iconWrapperStyles = css({
  display: 'grid',
  alignItems: 'center',
  height: '24px',
  width: '24px',
  flexShrink: 0,

  '&[data-variant="display"]': {
    position: 'absolute',
    top: 0,
    right: 0,
  },

  opacity: 'var(--widget-hover)',
});

const buttonWrapperStyles = css(
  {
    padding: '4px',
    flex: 0,
    backgroundColor: 'transparent',
    borderRadius: '4px',
    opacity: 'var(--widget-hover)',

    ':hover': {
      backgroundColor: cssVar('backgroundHeavy'),
    },

    '&[data-variant="display"]': {
      position: 'absolute',
      top: 0,
      right: 0,
      width: '24px',
      height: '24px',
    },
  },
  hoverTransitionStyles('all')
);

const variableNameStyles = css({
  alignSelf: 'start',
  flexGrow: 2,
  minWidth: 0,
  position: 'relative',

  '::after': {
    display: 'block',
    height: '100%',
    width: '24px',
    content: '""',
    right: 0,
    top: 0,
    position: 'absolute',
    pointerEvents: 'none',
  },
});

const toggleWrapperStyles = css({
  display: 'flex',
  gap: '8px',
  width: 'fit-content',
  minHeight: '40px',
  alignItems: 'center',
  padding: '0px 8px 0px 8px',
});

const hiddenChildrenStyles = css({
  display: 'none',
});

const wrappedChildrenStyles = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '0px',
});

const editorWrapperStyles = css({
  width: '100%',
});

interface VariableEditorProps {
  children?: ReactNode;
  color?: AvailableSwatchColor;
  readOnly?: boolean;
  type?: SerializedType;
  variant?: ElementVariants;
  value?: string;
  onChangeValue?: (
    value: string | undefined // only booleans for now
  ) => void;
  onClickEdit?: () => void;
  insideLayout?: boolean;
}

export const VariableEditor = ({
  children,
  readOnly = false,
  color = 'Catskill',
  type,
  value,
  onChangeValue = noop,
  onClickEdit,
  variant,
  insideLayout = false,
}: VariableEditorProps): ReturnType<FC> => {
  const childrenArray = Children.toArray(children);
  const [datePickerOpen, setDatePickerOpen] = useState<boolean>(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  const onWindowKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!datePickerOpen) return;
      switch (true) {
        case event.key === 'Escape':
          setDatePickerOpen(false);
          break;
      }
    },
    [datePickerOpen, setDatePickerOpen]
  );

  const onWindowClick = useCallback((event: Event) => {
    if (
      datePickerRef.current &&
      !datePickerRef.current.contains(event.target as Node)
    ) {
      setDatePickerOpen(false);
    }
  }, []);

  useWindowListener('keydown', onWindowKeyDown);
  useWindowListener('click', onWindowClick);
  const swatchColor = useSwatchColor(color, 'vivid', 'base');
  const selected = useSelected();

  const editor = useCallback(() => {
    if (variant === 'display' || childrenArray.length === 0) {
      return null;
    }

    const wrappedChildren = (
      <div css={wrappedChildrenStyles}>{childrenArray.slice(1)}</div>
    );

    if (variant === 'date') {
      return (
        <DatePickerWrapper
          granularity={type && 'date' in type ? type.date : undefined}
          value={value ?? ''}
          open={datePickerOpen}
          onChange={(newDate) => {
            onChangeValue(newDate);
            setDatePickerOpen(false);
          }}
          customInput={
            <>
              <div onClick={() => setDatePickerOpen(true)} ref={datePickerRef}>
                {childrenArray.slice(1)}
              </div>
            </>
          }
        />
      );
    }

    if (variant === 'toggle') {
      return (
        <div contentEditable={false} css={toggleWrapperStyles}>
          <Toggle
            variant="small-switch"
            active={value === 'true'}
            onChange={(newValue) => onChangeValue(newValue ? 'true' : 'false')}
            color={color}
          />

          <span
            css={[
              p24Medium,
              {
                color: swatchColor.hex,
              },
            ]}
          >
            {value === 'true' ? 'True' : 'False'}
          </span>

          <div css={hiddenChildrenStyles}>{wrappedChildren}</div>
        </div>
      );
    }

    return wrappedChildren;
  }, [
    childrenArray,
    onChangeValue,
    type,
    value,
    variant,
    datePickerOpen,
    color,
    swatchColor.hex,
  ])();

  return (
    <WidgetWrapper
      fullHeight={insideLayout}
      maxWidth={!insideLayout}
      selected={selected}
      readOnly={readOnly}
      className={'block-table'}
    >
      <div
        css={[
          headerWrapperStyles,
          variant === 'display' && {
            gap: 0,
          },
        ]}
      >
        <div css={variableNameStyles}>{childrenArray[0]}</div>
        {variant && !readOnly && onClickEdit && (
          <div
            contentEditable={false}
            css={iconWrapperStyles}
            data-variant={variant}
          >
            <button
              type="button"
              className="settingsButtonWrapper"
              css={buttonWrapperStyles}
              data-variant={variant}
              onClick={onClickEdit}
            >
              <Settings2 />
            </button>
          </div>
        )}
      </div>
      <div css={editorWrapperStyles}>{editor}</div>
    </WidgetWrapper>
  );
};
