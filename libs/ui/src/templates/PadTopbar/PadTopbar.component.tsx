import { css } from '@emotion/react';
import { FiArrowLeft, FiShare2 } from 'react-icons/fi';
import { Avatar } from '../../atoms';

const wrapperStyles = css({
  height: '60px',
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  padding: '16px',
  borderBottom: '1px solid #f0f0f2',
});

const navigationStyles = css({
  display: 'flex',
  alignItems: 'center',
  height: '100%',
});

const iconWrapper = css({
  borderRadius: '100px',
  width: '28px',
  height: '28px',
  border: '1px solid #f0f0f2',
  display: 'grid',
  placeItems: 'center',
});

const padTitle = css({
  padding: '0 1rem',
  fontWeight: 500,
  '@media screen and (max-width: 786px)': {
    fontSize: '12px',
  },
});

const shareButtonStyles = css({
  padding: '6px 14px',
  backgroundColor: '#f0f0f2',
  color: '#111',
  fontWeight: 500,
  display: 'flex',
  alignItems: 'center',
  justifyItems: 'space-around',
  border: 'none',
  borderRadius: '6px',
  transition: 'background-color 0.2s ease-out',
  '&:hover': {
    backgroundColor: '#E3E3E5',
  },
  '@media screen and (max-width: 768px)': {
    fontSize: '12px',
  },
});

export interface PadTopbarProps {
  notebookTitle: string;
  userName: string;
  backArrowOnClick: () => void;
}

export const PadTopbar = ({
  notebookTitle,
  userName,
  backArrowOnClick,
}: PadTopbarProps) => {
  return (
    <div css={wrapperStyles}>
      <div css={navigationStyles}>
        <button css={iconWrapper} onClick={backArrowOnClick}>
          <FiArrowLeft size="16px" />
        </button>
        <h1 css={padTitle}>{notebookTitle}</h1>
      </div>
      <div css={navigationStyles}>
        <button css={shareButtonStyles}>
          <FiShare2 size="18px" style={{ paddingRight: '6px' }} />{' '}
          <span>Share</span>
        </button>
        <div style={{ width: '24px', height: '100%' }} />
        <Avatar userName={userName} />
      </div>
    </div>
  );
};
