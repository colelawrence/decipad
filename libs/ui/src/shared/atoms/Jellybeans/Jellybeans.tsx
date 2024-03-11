import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { Property } from 'csstype';
import { cssVar, offBlack, offWhite, p12Medium } from 'libs/ui/src/primitives';
import { ReactNode } from 'react';

function getContrastYIQ(hexColor: string) {
  const tHC = hexColor.replace('#', ''); // temp hex color ofc
  const r = parseInt(tHC.substr(0, 2), 16);
  const g = parseInt(tHC.substr(2, 2), 16);
  const b = parseInt(tHC.substr(4, 2), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? offBlack.hex : offWhite.hex;
}

type JellyBeanProps = {
  readonly text: string;
  readonly onClick?: () => void;
  readonly disabled?: boolean;
  readonly backgroundColor?: Property.Color;
  readonly icon?: ReactNode;
};

export type JellyBrainsProps = {
  readonly beans: JellyBeanProps[];
};

const JellyBean = ({
  text,
  onClick = noop,
  backgroundColor,
  disabled = false,
  icon,
}: JellyBeanProps) => {
  const beanStyle = beanWrapperStyles(disabled, backgroundColor);
  return (
    <button css={beanStyle} type="button" onClick={onClick} disabled={disabled}>
      {icon}
      {text}
    </button>
  );
};

export const JellyBeans = ({ beans }: JellyBrainsProps) => (
  <div css={jellyBrainsWrapperStyles} contentEditable={false}>
    {beans.map(({ text, onClick, backgroundColor, disabled, icon }, index) => (
      <JellyBean
        key={index}
        text={text}
        onClick={onClick}
        backgroundColor={backgroundColor}
        disabled={disabled}
        icon={icon}
      />
    ))}
  </div>
);

const beanWrapperStyles = (
  disabled: boolean,
  backgroundColor?: Property.Color
) =>
  css(
    p12Medium,
    {
      display: 'flex',
      backgroundColor: backgroundColor || cssVar('backgroundDefault'),
      padding: '6px 12px 6px 9px',
      borderRadius: 6,
      color:
        backgroundColor && backgroundColor.startsWith('#')
          ? getContrastYIQ(backgroundColor)
          : cssVar('textDefault'),

      gap: 4,
      svg: {
        width: 13,
        height: 13,
      },
    },
    !disabled && {
      '&:hover': {
        background: cssVar('backgroundHeavy'),
      },
    },
    !disabled &&
      backgroundColor && {
        '&:hover': {
          background: backgroundColor,
          boxShadow: `inset 0 0 0 9999px rgba(0, 0, 0, 0.2)`,
        },
      },
    disabled && {
      cursor: 'not-allowed',
      backgroundColor: cssVar('backgroundSubdued'),
      '&:hover': null,
    }
  );

const jellyBrainsWrapperStyles = css({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'start',
  gridGap: 8,
  marginBottom: 8,
});
