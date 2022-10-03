import { css } from '@emotion/react';
import { Children, ComponentProps, FC, ReactNode, useMemo } from 'react';
import { CellValueType } from '@decipad/editor-types';
import { noop } from 'lodash';
import { useSelected } from 'slate-react';
import { CellEditor } from '../../molecules';
import { Ellipsis, Virus } from '../../icons';
import {
  offBlack,
  cssVar,
  grey300,
  grey700,
  setCssVar,
  transparency,
  white,
} from '../../primitives';
import { VariableEditorMenu } from '..';
import { AvailableSwatchColor, baseSwatches, getTypeIcon } from '../../utils';

const leftBarSize = 6;

const wrapperStyles = (color: string) =>
  css({
    // Because `borderImage` with a linear gradient and `borderRadius` cannot
    // work together, we mimic a border by setting a linear gradient in the
    // background and clipping the content box.
    border: '1px solid transparent',
    borderRadius: '8px',
    backgroundImage: `linear-gradient(${cssVar('backgroundColor')}, ${cssVar(
      'backgroundColor'
    )}), linear-gradient(to right, ${color} 0%, ${grey300.rgb} 18.71%)`,
    backgroundOrigin: 'border-box',
    backgroundClip: 'content-box, border-box',

    // Last shadow is the left side color bar.
    boxShadow: `0px 2px 20px ${transparency(grey700, 0.04).rgba},
     0px 2px 8px ${transparency(offBlack, 0.02).rgba},
     -${leftBarSize}px 0px ${color}`,
    marginLeft: `${leftBarSize}px`,

    maxWidth: `324px`,
    minWidth: '175px',
    width: '100%',
  });

const widgetWrapperStyles = css({
  alignItems: 'center',
  display: 'grid',
  gap: '4px',
  padding: '8px',
});

const headerWrapperStyles = css({
  display: 'inline-flex',
  gridAutoColumns: 'auto',
  minWidth: 0,
  gap: '4px',
});

const iconWrapperStyles = css(
  setCssVar('currentTextColor', cssVar('weakTextColor')),
  {
    display: 'grid',
    height: '20px',
    width: '20px',
    flexShrink: 0,
  }
);

const buttonWrapperStyles = css({
  padding: '2px',
  flexShrink: 0,
  ':hover': {
    backgroundColor: cssVar('highlightColor'),
    borderRadius: '50%',
  },
});

const variableNameStyles = (
  props: Pick<ComponentProps<typeof VariableEditorMenu>, 'variant'>
) =>
  css({
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
      ...(props.variant !== 'display' && {
        color: 'white',
        background: `linear-gradient(
      90deg,
      ${transparency(white, 0).rgba},
      ${cssVar('backgroundColor')}
    )`,
      }),
    },
  });

interface VariableEditorProps
  extends Omit<ComponentProps<typeof VariableEditorMenu>, 'trigger'> {
  children?: ReactNode;
  color?: AvailableSwatchColor;
  readOnly?: boolean;
  type?: CellValueType;
  onChangeType?: (type: CellValueType | undefined) => void;
  value?: string;
  onChangeValue?: (
    value: string | undefined // only booleans for now
  ) => void;
}

export const VariableEditor = ({
  children,
  readOnly = false,
  color = 'Sulu',
  type,
  onChangeType = noop,
  value,
  onChangeValue = noop,
  ...menuProps
}: VariableEditorProps): ReturnType<FC> => {
  const childrenArray = Children.toArray(children);
  const Icon = useMemo(
    () => (type && getTypeIcon(type, true)) ?? Virus,
    [type]
  );
  const selected = useSelected();

  return (
    <div
      css={wrapperStyles(
        menuProps.variant === 'display' ? '#FFFFFF' : baseSwatches[color].rgb
      )}
    >
      <div css={widgetWrapperStyles}>
        <div css={headerWrapperStyles}>
          <>
            <div
              css={variableNameStyles({
                variant: menuProps.variant || 'expression',
              })}
            >
              {childrenArray[0]}
            </div>
            {!readOnly && menuProps.variant !== 'display' && (
              <span contentEditable={false} css={iconWrapperStyles}>
                <Icon />
              </span>
            )}
            <div contentEditable={false} css={iconWrapperStyles}>
              {!readOnly && (
                // TS can't tell which variant of the union type that composes VariableEditorMenu
                // is being used at any given moment but we're using these type definitions on
                // VariableEditor's typings, so we know things will be ok in the end, we just need
                // TS to shut up.
                <VariableEditorMenu
                  {...(menuProps as ComponentProps<typeof VariableEditorMenu>)}
                  trigger={
                    <button css={buttonWrapperStyles}>
                      <Ellipsis />
                    </button>
                  }
                  type={type}
                  onChangeType={onChangeType}
                />
              )}
            </div>
          </>
        </div>
        {menuProps.variant !== 'display' && (
          <CellEditor
            type={type}
            value={value}
            onChangeValue={onChangeValue}
            focused={selected}
          >
            {childrenArray.slice(1)}
          </CellEditor>
        )}
      </div>
    </div>
  );
};
