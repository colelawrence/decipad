/* eslint decipad/css-prop-named-variable: 0 */
import { css, Global } from '@emotion/react';
import { FC } from 'react';
import { Google } from '../../icons';
import { componentCssVars } from '../../primitives';

const connectButtonStyles = css({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '1px',
  height: '40px',
  border: `1px solid ${componentCssVars('GoogleButtonBorder')}`,
  backgroundColor: componentCssVars('GoogleButtonBackground'),
  fontFamily: '"Roboto", sans-serif',
  color: componentCssVars('GoogleButtonText'),
  fontSize: '14px',
  fontWeight: 500,
  lineHeight: '20px',
  borderRadius: '4px',
  cursor: 'pointer',

  '&:hover': {
    backgroundColor: componentCssVars('GoogleButtonHoverBackground'),
  },

  '&:active, &:focus': {
    outline: 'none',
    boxShadow: '0px 0px 0px 2px rgba(66, 133, 244, 0.3)',
  },

  '&:disabled': {
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
    filter: 'brightness(0%)',
    color: '#000000',
    cursor: 'not-allowed',

    '& > span': {
      backgroundColor: 'transparent',
    },

    '&:active, &:focus': {
      boxShadow: 'none',
    },
  },
});

const connectButtonIconStyles = css({
  height: '36px',
  width: '36px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'white',
  borderRadius: '2px',

  '& > svg': {
    height: '18px',
    width: '18px',
  },
});

const googleFont = css`
  @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@500&display=swap');
`;

type GoogleConnectButtonProps = {
  disabled?: boolean;
  onClick: () => void;
};

export const GoogleConnectButton: FC<GoogleConnectButtonProps> = ({
  disabled,
  onClick,
}) => {
  return (
    <>
      <Global styles={googleFont} />
      <button disabled={disabled} onClick={onClick} css={connectButtonStyles}>
        <span css={connectButtonIconStyles}>
          <Google />
        </span>
        <span css={{ marginRight: '8px' }}>Sign in with Google</span>
      </button>
    </>
  );
};
