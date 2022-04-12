import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { Frame } from '../../icons';
import {
  cssVar,
  display,
  Opacity,
  p16Regular,
  setCssVar,
} from '../../primitives';

interface CaptionProps {
  icon?: ReactNode;
  empty?: boolean;
  children: ReactNode;
}

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

const placeholderOpacity: Opacity = 0.4;

const placeholderStyles = css(p16Regular, {
  display: 'grid',
  '> span, ::before': {
    gridArea: '1 / 1',
  },

  '::before': {
    ...display,
    ...p16Regular,
    ...setCssVar('currentTextColor', cssVar('weakTextColor')),
    pointerEvents: 'none',
    content: 'attr(aria-placeholder)',
    opacity: placeholderOpacity,
  },
});

export const Caption = ({
  icon = <Frame />,
  empty = false,
  children,
}: CaptionProps): ReturnType<FC> => {
  return (
    <div css={nameWrapperStyles}>
      <span contentEditable={false} css={iconWrapperStyles}>
        {icon}
      </span>
      <div
        css={placeholderStyles}
        aria-placeholder={empty ? 'VariableName' : ''}
      >
        <span>
          <span>{children}</span>
        </span>
      </div>
    </div>
  );
};
