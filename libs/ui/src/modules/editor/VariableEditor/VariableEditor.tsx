/* eslint decipad/css-prop-named-variable: 0 */
import type { SerializedType } from '@decipad/remote-computer';
import { useThemeFromStore } from '@decipad/react-contexts';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { Children, FC, ReactNode, useCallback, useMemo } from 'react';
import { useSelected } from 'slate-react';
import { DatePickerWrapper, Toggle } from '../../../shared';
import {
  cssVar,
  grey700,
  p24Medium,
  offBlack,
  transparency,
  smallScreenQuery,
  shortAnimationDuration,
} from '../../../primitives';
import { AvailableSwatchColor, swatchesThemed } from '../../../utils';
import { ElementVariants } from '@decipad/editor-types';
import { Settings2 } from 'libs/ui/src/icons';

const leftBarSize = 2;

export const wrapperStyles = ({
  color,
  insideLayout = false,
}: {
  color: string;
  insideLayout?: boolean;
}) => {
  const bgColor = cssVar('backgroundMain');

  const finalColor = cssVar('borderSubdued');
  const gradient = `linear-gradient(${bgColor}, ${bgColor}), linear-gradient(to right, ${color} 0%, ${finalColor} 18.71%)`;

  return css({
    maxWidth: insideLayout ? 'none' : '262px',
    minWidth: '175px',
    width: '100%',

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

    '--variable-editor-hover': 0,

    '&:hover': {
      '--variable-editor-hover': 1,
    },
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

const iconWrapperStyles = (variant: ElementVariants) =>
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

const buttonWrapperStyles = (variant: ElementVariants) =>
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
  minHeight: '40px',
  alignItems: 'center',
  padding: '0px 8px 0px 8px',
});

const hiddenChildrenStyles = css({
  display: 'none',
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
  const [darkTheme] = useThemeFromStore();
  const baseSwatches = useMemo(() => swatchesThemed(darkTheme), [darkTheme]);

  const selected = useSelected();

  const editor = useCallback(() => {
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
  }, [childrenArray, onChangeValue, selected, type, value, variant])();

  return (
    <div
      aria-roledescription="column-content"
      className={'block-table'}
      css={wrapperStyles({ color: baseSwatches[color].rgb, insideLayout })}
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
          <div css={variableNameStyles}>{childrenArray[0]}</div>

          {variant && !readOnly && onClickEdit && (
            <div
              contentEditable={false}
              css={[
                iconWrapperStyles(variant),
                {
                  // Always visible on devices that cannot hover
                  '@media (hover: hover)': {
                    opacity: 'var(--variable-editor-hover)',
                    transition: `opacity ${shortAnimationDuration}`,
                  },
                },
              ]}
            >
              <button
                type="button"
                css={buttonWrapperStyles(variant)}
                onClick={onClickEdit}
              >
                <Settings2 />
              </button>
            </div>
          )}
        </div>

        {editor}
      </div>
    </div>
  );
};
