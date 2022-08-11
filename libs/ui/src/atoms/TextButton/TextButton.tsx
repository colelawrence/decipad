import { css } from '@emotion/react';

const buttonWrapperStyles = css({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '0px 16px',
  gap: 4,
});

interface TextButtonProps {
  readonly text: string;
}

export const TextButton: React.FC<TextButtonProps> = ({ text }) => {
  return <div css={buttonWrapperStyles}>{text}</div>;
};
