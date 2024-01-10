/* eslint decipad/css-prop-named-variable: 0 */
import type {
  IdentifiedError,
  IdentifiedResult,
  SerializedType,
} from '@decipad/remote-computer';
import { useThemeFromStore } from '@decipad/react-contexts';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { Children, ComponentProps, FC, ReactNode, useMemo } from 'react';
import { useSelected } from 'slate-react';
import { VariableEditorMenu } from '..';
import { Ellipsis, Virus } from '../../icons';
import { DatePickerWrapper, Toggle } from '../../atoms';
import {
  cssVar,
  grey700,
  p24Medium,
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

export const wrapperStyles = (color: string) => {
  const bgColor = cssVar('backgroundMain');

  const finalColor = cssVar('borderSubdued');
  const gradient = `linear-gradient(${bgColor}, ${bgColor}), linear-gradient(to right, ${color} 0%, ${finalColor} 18.71%)`;
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

const toggleWrapperStyles = css({
  display: 'flex',
  gap: '8px',
  minHeight: '40px',
  alignItems: 'center',
  padding: '0px 8px 0px 8px',
});

const hiddenChildrenStyles = css({
  display: 'none',
});

interface VariableEditorProps
  extends Omit<ComponentProps<typeof VariableEditorMenu>, 'trigger'> {
  children?: ReactNode;
  color?: AvailableSwatchColor;
  readOnly?: boolean;
  type?: SerializedType;
  onChangeType?: (type: SerializedType | 'smart-selection' | undefined) => void;
  value?: string;
  lineResult?: IdentifiedResult | IdentifiedError;
  onChangeValue?: (
    value: string | undefined // only booleans for now
  ) => void;
  smartSelection?: boolean;
}

export const VariableEditor = ({
  children,
  readOnly = false,
  color = 'Catskill',
  type,
  onChangeType = noop,
  value,
  lineResult,
  onChangeValue = noop,
  variant,
  ...menuProps
}: VariableEditorProps): ReturnType<FC> => {
  const childrenArray = Children.toArray(children);
  const [darkTheme] = useThemeFromStore();
  const baseSwatches = useMemo(() => swatchesThemed(darkTheme), [darkTheme]);

  const Icon = useMemo(() => (type && getTypeIcon(type)) ?? Virus, [type]);
  const selected = useSelected();

  const resultType = lineResult?.result?.type;

  const editor = (() => {
    if (variant === 'display' || childrenArray.length === 0) {
      return null;
    }

    const wrappedChildren = (
      <div css={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
        {childrenArray.slice(1)}
      </div>
    );

    if (variant === 'date') {
      return (
        <DatePickerWrapper
          granularity={type && 'date' in type ? type.date : undefined}
          value={value ?? ''}
          open={selected}
          onChange={onChangeValue}
          customInput={wrappedChildren}
        />
      );
    }

    if (variant === 'toggle') {
      return (
        <div contentEditable={false} css={toggleWrapperStyles}>
          <Toggle
            active={value === 'true'}
            onChange={(newValue) => onChangeValue(newValue ? 'true' : 'false')}
          />

          <span css={p24Medium}>{value === 'true' ? 'true' : 'false'}</span>

          <div css={hiddenChildrenStyles}>{wrappedChildren}</div>
        </div>
      );
    }

    return wrappedChildren;
  })();

  return (
    <div
      aria-roledescription="column-content"
      className={'block-table'}
      css={wrapperStyles(baseSwatches[color].rgb)}
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
                  readOnly && { display: 'none' },
                ]}
              >
                <Icon />
              </span>
            )}
            {isMenuVariant(variant) && (
              <div
                contentEditable={false}
                css={[
                  iconWrapperStyles(variant),
                  readOnly && { display: 'none' },
                ]}
              >
                <VariableEditorMenu
                  {...({ ...menuProps, variant } as ComponentProps<
                    typeof VariableEditorMenu
                  >)}
                  trigger={
                    <button css={[buttonWrapperStyles(variant)]}>
                      <Ellipsis />
                    </button>
                  }
                  lineResult={lineResult}
                  type={variant !== 'display' ? type : resultType}
                  onChangeType={onChangeType}
                />
              </div>
            )}
          </>
        </div>

        {editor}
      </div>
    </div>
  );
};

/**
 * Small helper function
 * Does this variant have a menu (...), on the top right?
 */
function isMenuVariant(variant: Variant): boolean {
  return !(variant === 'date' || variant === 'toggle');
}
