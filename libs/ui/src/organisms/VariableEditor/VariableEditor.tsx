/* eslint decipad/css-prop-named-variable: 0 */
import { SerializedType } from '@decipad/computer';
import { AnyElement } from '@decipad/editor-types';
import { useThemeFromStore } from '@decipad/react-contexts';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
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
  smallestDesktop,
  transparency,
  white,
} from '../../primitives';
import { columns } from '../../styles';
import { AvailableSwatchColor, getTypeIcon, swatchesThemed } from '../../utils';

const leftBarSize = 2;
const smallScreenQuery = `@media (max-width: ${smallestDesktop.portrait.width}px)`;

type Variant = Pick<
  ComponentProps<typeof VariableEditorMenu>,
  'variant'
>['variant'];

const wrapperStyles = (variant: Variant, color: string) => {
  const bgColor = cssVar('backgroundMain');
  const targetColor = variant === 'display' ? grey300.rgb : color;
  const finalColor = cssVar('borderSubdued');
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
    boxShadow: `0px 2px 20px ${transparency(grey700, 0.02).rgba},
     0px 2px 8px ${transparency(offBlack, 0.02).rgba},
     -${leftBarSize}px 0px ${color}`,
    marginLeft: `${leftBarSize}px`,
    ...columns.styles,
  });
};

const widgetWrapperStyles = css({
  alignItems: 'center',
  display: 'grid',
  gap: '5px',
  padding: '6px 6px 10px',
  minHeight: '84px',
});

const headerWrapperStyles = css({
  position: 'relative',
  display: 'inline-flex',
  gridAutoColumns: 'auto',
  minWidth: 0,
  gap: '4px',
  padding: '0 2px',
});

const iconWrapperStyles = (variant: Variant) =>
  css({
    display: 'grid',
    alignItems: 'center',
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

const buttonWrapperStyles = (variant: Variant) =>
  css({
    padding: '2px',
    flexShrink: 0,
    ':hover': {
      backgroundColor: cssVar('backgroundDefault'),
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

const variableNameStyles = (variant: Variant) =>
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
      ${cssVar('backgroundMain')}
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
  color = 'Catskill',
  type,
  onChangeType = noop,
  value,
  onChangeValue = noop,
  element,
  variant,
  ...menuProps
}: VariableEditorProps): ReturnType<FC> => {
  const childrenArray = Children.toArray(children);
  const [darkTheme] = useThemeFromStore();
  const baseSwatches = swatchesThemed(darkTheme);

  const Icon = useMemo(() => (type && getTypeIcon(type)) ?? Virus, [type]);
  const selected = useSelected();
  return (
    <div
      aria-label="column-content"
      className={'block-table'}
      css={wrapperStyles(
        variant,
        variant === 'display' ? '#FFFFFF' : baseSwatches[color].rgb
      )}
      data-testid="widget-editor"
    >
      <div css={widgetWrapperStyles}>
        <div
          css={[
            headerWrapperStyles,
            variant === 'display' && {
              gap: 0,
            },
          ]}
        >
          <>
            <div css={variableNameStyles(variant)}>{childrenArray[0]}</div>
            {variant !== 'display' && (
              <span
                contentEditable={false}
                css={[
                  iconWrapperStyles(variant),
                  readOnly && { visibility: 'hidden' },
                ]}
              >
                <Icon />
              </span>
            )}
            {isMenuVariant(variant) && (
              <div contentEditable={false} css={iconWrapperStyles(variant)}>
                <VariableEditorMenu
                  {...({ ...menuProps, variant } as ComponentProps<
                    typeof VariableEditorMenu
                  >)}
                  trigger={
                    <button
                      css={[
                        buttonWrapperStyles(variant),
                        readOnly && { visibility: 'hidden' },
                      ]}
                    >
                      <Ellipsis />
                    </button>
                  }
                  type={type}
                  onChangeType={onChangeType}
                />
              </div>
            )}
          </>
        </div>
        {variant !== 'display' && childrenArray.length > 1 && (
          <CellEditor
            type={type}
            value={value}
            onChangeValue={onChangeValue}
            focused={selected}
            isEditable={!readOnly}
            element={element}
          >
            <div css={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
              {childrenArray.slice(1)}
            </div>
          </CellEditor>
        )}
      </div>
    </div>
  );
};

/**
 * Small helper function
 * Does this variant have a menu (...), on the top right?
 */
function isMenuVariant(variant: Variant): boolean {
  return !(variant === 'date' || variant === 'toggle' || variant === 'display');
}
