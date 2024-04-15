import { css } from '@emotion/react';
import {
  componentCssVars,
  cssVar,
  p12Regular,
  p13Bold,
  p15Medium,
  red500,
  transparency,
  weakOpacity,
} from 'libs/ui/src/primitives';

export const hiddenElement = css({
  display: 'none',
});

export const iconStyles = css({
  marginLeft: 'auto',

  height: '30px',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'end',

  div: {
    width: '16px',
    height: '16px',
  },
});

export const gap = 8;

export const importFileActionStyles = css({
  display: 'flex',
  flexDirection: 'column',
  gap,
});

export const importFileWrapperStyles = css({
  width: '100%',

  borderRadius: '6px',

  display: 'flex',
  flexDirection: 'column',
});

export const uploadWrapperStyles = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '12px',
});

export const uploadTitleStyles = css(p15Medium, {
  color: cssVar('textHeavy'),
  lineHeight: '30px',
  paddingRight: '15px',
  width: '100%',
});

export const titleWrapperStyles = css({
  color: cssVar('textHeavy'),
  height: '30px',
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'end',
});

export const tabWrapStyles = css({
  width: '100%',
  button: {
    svg: {
      height: 12,
      width: 12,
    },
  },
});

export const dndPlaceHolderStyles = css`
  background: ${cssVar('backgroundSubdued')};
  border: 1px dashed ${cssVar('backgroundHeavy')};
  border-radius: 8px;
`;

export const backgroundFor = (color1: string, color2: string) => {
  return {
    background: `repeating-linear-gradient(
    45deg,
    ${color1},
    ${color1} 8px,
    ${color2} 8px,
    ${color2} 16px
  )`,
  };
};

export const uploadingButtonPlaceholderStyles = ({
  uploadProgress,
}: {
  uploadProgress?: number;
}) =>
  css(
    p13Bold,
    {
      position: 'relative',
      flex: '0 0 100px',
      display: 'flex',
      gap: 4,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 14,
      borderRadius: '6px',
      backgroundColor: cssVar('backgroundSubdued'),
      color: componentCssVars('ButtonPrimaryDefaultText'),
    },
    uploadProgress && {
      maxHeight: 10,
      padding: 2,

      '&::before': {
        zIndex: 0,
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        borderRadius: '6px',
        backgroundColor: componentCssVars('ButtonPrimaryDefaultBackground'),
        width: `${uploadProgress}%`,
        animation: 'loading steps(1,end) 1s infinite',
        height: '100%',
      },

      '@keyframes loading': {
        '0%': backgroundFor(
          componentCssVars('ButtonPrimaryDefaultBackground'),
          componentCssVars('ButtonPrimaryHoverBackground')
        ),
        '25%': backgroundFor(
          componentCssVars('ButtonPrimaryHoverBackground'),
          componentCssVars('ButtonPrimaryDefaultBackground')
        ),
        '50%': backgroundFor(
          componentCssVars('ButtonPrimaryDefaultBackground'),
          componentCssVars('ButtonPrimaryHoverBackground')
        ),
        '75%': backgroundFor(
          componentCssVars('ButtonPrimaryHoverBackground'),
          componentCssVars('ButtonPrimaryDefaultBackground')
        ),
      },
    },
    dndPlaceHolderStyles
  );

export const allWrapperStyles = [uploadWrapperStyles];

export const dndLabelHeadingStyles = css(p15Medium, {
  color: cssVar('textHeavy'),
  display: 'flex',
  span: { minHeight: 16, minWidth: 16 },
});
export const dndLabelTextStyles = css(p12Regular, {
  color: cssVar('textSubdued'),
});

export const selectedFileStyles = css({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px',
  margin: '0',
  borderRadius: '6px',
  border: `1px solid ${cssVar('backgroundHeavy')}`,
  color: componentCssVars('ButtonPrimaryDefaultText'),
  gap: 8,
});

export const wrapperForImageGallery = css(
  importFileActionStyles,
  { flexDirection: 'column' },
  { overflowX: 'hidden' }
);

export const iconContainerStyle = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '16px',
  height: '16px',
});

export const selectedFileStylez = css({
  svg: { width: 16, height: 16 },
  padding: 0,
  borderRadius: 6,
});

export const fileWarningRoundStyles = css({
  padding: 8,
  borderRadius: 6,
  backgroundColor: transparency(red500, weakOpacity).rgba,
  svg: { height: 16, width: 16 },
});

export const fileNameStyles = css({ marginRight: '10px', flex: 1 });
export const imageOverSizeStyles = {
  textDecoration: 'underline',
  cursor: 'pointer',
};
