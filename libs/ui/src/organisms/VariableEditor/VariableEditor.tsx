import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { Children, ComponentProps, FC, ReactNode } from 'react';
import { AddNew } from '../../atoms';
import { Ellipsis } from '../../icons';
import { blockAlignment } from '../../styles';
import {
  offBlack,
  cssVar,
  grey300,
  grey700,
  setCssVar,
  transparency,
} from '../../primitives';
import { InteractiveInputMenu } from '../InteractiveInputMenu/InteractiveInputMenu';
import { AvailableSwatchColor, baseSwatches } from '../../utils';

const leftBarSize = 6;

const spacingStyles = css({
  display: 'flex',
  justifyContent: 'center',
  margin: `${blockAlignment.interactive.paddingTop} 0`,
});

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
});

const iconWrapperStyles = css(
  setCssVar('currentTextColor', cssVar('weakTextColor')),
  {
    display: 'grid',
    height: '20px',
    width: '20px',
  }
);

const buttonWrapperStyles = css({
  padding: '2px',
  ':hover': {
    backgroundColor: cssVar('highlightColor'),
    borderRadius: '50%',
  },
});

const addNewWrapperStyles = css({
  display: 'flex',
  justifyContent: 'center',
  marginLeft: '12px',
});

interface InteractiveProps
  extends Pick<ComponentProps<typeof AddNew>, 'onAdd'> {
  children?: ReactNode;
  color?: AvailableSwatchColor;
  readOnly?: boolean;
  onConvert?: () => void;
  onCopy?: () => void;
  onDelete?: () => void;
}

export const VariableEditor = ({
  children,
  onAdd,
  readOnly = false,
  color = 'Sulu',
  onConvert = noop,
  onCopy = noop,
  onDelete = noop,
}: InteractiveProps): ReturnType<FC> => {
  const childrenArray = Children.toArray(children);
  return (
    <div css={spacingStyles}>
      <div css={wrapperStyles(baseSwatches[color].rgb)}>
        <div css={widgetWrapperStyles}>
          <div css={headerWrapperStyles}>
            <div css={{ alignSelf: 'start', flexGrow: 2 }}>
              {childrenArray[0]}
            </div>
            <div contentEditable={false} css={iconWrapperStyles}>
              <InteractiveInputMenu
                onConvert={onConvert}
                onCopy={onCopy}
                onDelete={onDelete}
                trigger={
                  <button css={buttonWrapperStyles}>
                    <Ellipsis />
                  </button>
                }
              />
            </div>
          </div>
          {childrenArray[1]}
        </div>
      </div>
      <div css={addNewWrapperStyles}>
        {!readOnly && <AddNew onAdd={onAdd}></AddNew>}
      </div>
    </div>
  );
};
