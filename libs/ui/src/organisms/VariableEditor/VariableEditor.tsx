import { AnyElement } from '@decipad/editor-types';
import { SerializedType } from '@decipad/computer';
import { useThemeFromStore } from '@decipad/react-contexts';
import { css } from '@emotion/react';
import { noop } from 'lodash';
import { Children, ComponentProps, FC, ReactNode, useMemo } from 'react';
import { useSelected } from 'slate-react';
import { VariableEditorMenu } from '..';
import { Ellipsis, Virus } from '../../icons';
import { CellEditor } from '../../molecules';
import {
  cssVar,
  grey300,
  grey700,
  offBlack,
  setCssVar,
  smallScreenQuery,
  transparency,
  white,
} from '../../primitives';
import { AvailableSwatchColor, getTypeIcon, swatchesThemed } from '../../utils';

const leftBarSize = 6;

type Variant = Pick<ComponentProps<typeof VariableEditorMenu>, 'variant'>;

const wrapperStyles = ({ variant }: Variant, color: string) => {
  const bgColor = cssVar('backgroundColor');
  const targetColor = variant === 'display' ? grey300.rgb : color;
  const finalColor = cssVar('borderColor');
  const gradient = `linear-gradient(${bgColor}, ${bgColor}), linear-gradient(to right, ${targetColor} 0%, ${finalColor} 18.71%)`;
  return css({
    // Because `borderImage` with a linear gradient and `borderRadius` cannot
    // work together, we mimic a border by setting a linear gradient in the
    // background and clipping the content box.
    border: '1px solid transparent',
    borderRadius: '8px',
    backgroundImage: gradient,
    backgroundOrigin: 'border-box',
    backgroundClip: 'content-box, border-box',

    // Last shadow is the left side color bar.
    boxShadow: `0px 2px 20px ${transparency(grey700, 0.04).rgba},
     0px 2px 8px ${transparency(offBlack, 0.02).rgba},
     -${leftBarSize}px 0px ${color}`,
    marginLeft: `${leftBarSize}px`,

    maxWidth: `262px`,
    minWidth: '175px',
    width: '100%',
  });
};

const widgetWrapperStyles = css({
  alignItems: 'center',
  display: 'grid',
  gap: '8px',
  padding: '8px 8px 16px',
});

const headerWrapperStyles = css({
  position: 'relative',
  display: 'inline-flex',
  gridAutoColumns: 'auto',
  minWidth: 0,
  gap: '4px',
});

const iconWrapperStyles = ({ variant }: Variant) =>
  css(setCssVar('currentTextColor', cssVar('weakTextColor')), {
    display: 'grid',
    height: '20px',
    width: '20px',
    flexShrink: 0,
    ...(variant === 'display' && {
      position: 'absolute',
      top: 0,
      right: 0,
    }),

    [smallScreenQuery]: {
      height: '16px',
      width: '16px',
    },
  });

const buttonWrapperStyles = ({ variant }: Variant) =>
  css({
    padding: '2px',
    flexShrink: 0,
    ':hover': {
      backgroundColor: cssVar('highlightColor'),
      borderRadius: '50%',
    },
    ...(variant === 'display' && {
      position: 'absolute',
      top: 0,
      right: 0,
      width: '20px',
      height: '20px',
    }),
  });

const variableNameStyles = ({ variant }: Variant) =>
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
      ...(variant !== 'display' && {
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
  type?: SerializedType;
  onChangeType?: (type: SerializedType | 'smart-selection' | undefined) => void;
  value?: string;
  onChangeValue?: (
    value: string | undefined // only booleans for now
  ) => void;
  smartSelection?: boolean;
  element?: AnyElement;
}

export const VariableEditor = ({
  children,
  readOnly = false,
  color = 'Sulu',
  type,
  onChangeType = noop,
  value,
  onChangeValue = noop,
  element,
  ...menuProps
}: VariableEditorProps): ReturnType<FC> => {
  const childrenArray = Children.toArray(children);
  const [darkTheme] = useThemeFromStore();
  const baseSwatches = swatchesThemed(darkTheme);

  const Icon = useMemo(
    () => (type && getTypeIcon(type, true)) ?? Virus,
    [type]
  );
  const selected = useSelected();
  return (
    <div
      css={wrapperStyles(
        { variant: menuProps.variant },
        menuProps.variant === 'display' ? '#FFFFFF' : baseSwatches[color].rgb
      )}
    >
      <div css={widgetWrapperStyles}>
        <div
          css={[
            headerWrapperStyles,
            menuProps.variant === 'display' && {
              gap: 0,
            },
          ]}
        >
          <>
            <div
              css={variableNameStyles({
                variant: menuProps.variant,
              })}
            >
              {childrenArray[0]}
            </div>
            {!readOnly && menuProps.variant !== 'display' && (
              <span
                contentEditable={false}
                css={iconWrapperStyles({ variant: menuProps.variant })}
              >
                <Icon />
              </span>
            )}
            <div
              contentEditable={false}
              css={iconWrapperStyles({ variant: menuProps.variant })}
            >
              {!readOnly && (
                // TS can't tell which variant of the union type that composes VariableEditorMenu
                // is being used at any given moment but we're using these type definitions on
                // VariableEditor's typings, so we know things will be ok in the end, we just need
                // TS to shut up.
                <VariableEditorMenu
                  {...(menuProps as ComponentProps<typeof VariableEditorMenu>)}
                  trigger={
                    <button
                      css={buttonWrapperStyles({
                        variant: menuProps.variant,
                      })}
                    >
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
        {menuProps.variant !== 'display' && childrenArray.length > 1 && (
          <CellEditor
            type={type}
            value={value}
            onChangeValue={onChangeValue}
            focused={selected}
            element={element}
          >
            <div css={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {childrenArray.slice(1)}
            </div>
          </CellEditor>
        )}
      </div>
    </div>
  );
};
