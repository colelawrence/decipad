import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { Frame } from '../../icons';
import {
  black,
  brand600,
  cssVar,
  grey300,
  grey700,
  p13Medium,
  setCssVar,
  transparency,
} from '../../primitives';
import { identifierNamePattern } from '../../utils/language';
import { useSubmittableInput } from '../../utils/useSubmittableInput';

const transformIdentifierName = (newValue: string): string =>
  newValue.match(identifierNamePattern)?.join('') ?? '';

const leftBarSize = 6;

const spacingStyles = css({
  display: 'grid',
  justifyContent: 'center',

  margin: '34px 0',
});

const wrapperStyles = css({
  // Because `borderImage` with a linear gradient and `borderRadius` cannot
  // work together, we mimick a border by setting a linear gradient in the
  // background and clipping the content box.
  border: '1px solid transparent',
  borderRadius: '8px',
  backgroundImage: `linear-gradient(${cssVar('backgroundColor')}, ${cssVar(
    'backgroundColor'
  )}), linear-gradient(to right, ${brand600.rgb} 0%, ${grey300.rgb} 18.71%)`,
  backgroundOrigin: 'border-box',
  backgroundClip: 'content-box, border-box',

  // Last shadow is the left side color bar.
  boxShadow: `0px 2px 20px ${transparency(grey700, 0.04).rgba}, 
    0px 2px 8px ${transparency(black, 0.02).rgba}, 
    -${leftBarSize}px 0px ${brand600.rgb}`,
  marginLeft: `${leftBarSize}px`,

  maxWidth: '324px',
});

const widgetWrapperStyles = css({
  alignItems: 'center',
  display: 'grid',
  gap: '9px',
  padding: '12px',
});

const nameWrapperStyles = css({
  alignItems: 'center',
  display: 'flex',
  gap: '4px',
});

const iconWrapperStyles = css(
  setCssVar('currentTextColor', cssVar('weakTextColor')),
  {
    display: 'grid',
    height: '20px',
    width: '20px',
  }
);

const inputStyles = css(
  p13Medium,
  setCssVar('currentTextColor', cssVar('weakTextColor')),
  {
    backgroundColor: cssVar('backgroundColor'),
    flexGrow: 1,
    padding: '1px 0',
    textOverflow: 'ellipsis',
  }
);

type InputProps = Parameters<typeof useSubmittableInput>[0];

interface InteractiveProps {
  children: ReactNode;
  icon?: ReactNode;
  name?: InputProps['value'];
  onChangeName?: InputProps['onChange'];
  readOnly?: boolean;
  right?: ReactNode;
}

export const Interactive = ({
  children,
  icon = <Frame />,
  name = '',
  onChangeName = noop,
  readOnly = false,
  right,
}: InteractiveProps): ReturnType<FC> => {
  const nameInputProps = useSubmittableInput({
    onChange: onChangeName,
    transform: transformIdentifierName,
    value: name,
  });

  return (
    <div css={spacingStyles}>
      <div css={wrapperStyles}>
        <div css={widgetWrapperStyles}>
          <div css={nameWrapperStyles}>
            <span css={iconWrapperStyles}>{icon}</span>
            <input
              {...nameInputProps}
              css={inputStyles}
              placeholder="VariableName"
              readOnly={readOnly}
              size={1}
            />
            {!readOnly && right && <span css={iconWrapperStyles}>{right}</span>}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};
