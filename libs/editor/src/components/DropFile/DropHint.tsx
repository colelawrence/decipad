import { FC, ReactNode } from 'react';
import { css } from '@emotion/react';

interface DropHintProps {
  isActive: boolean;
  children: ReactNode;
}

const activeStyle = css({
  position: 'absolute',
  backgroundColor: 'rgba(0,0,0,0.1)',
  color: '#fff',
  textAlign: 'center',
  padding: '14em 0',
  margin: '0 auto',
  zIndex: 1000,
  width: '100%',
  minHeight: '400px',
  fontSize: '30px',
  fontWeight: 'bold',
  borderRadius: '2%',
});

const activeChildrenWrapperStyle = css({
  zIndex: 0,
  backgroundColor: 'rgba(255,255,255,0.9)',
});

export function DropHint({
  children,
  isActive,
}: DropHintProps): ReturnType<FC> {
  // TODO: style this accordingly
  const style = isActive ? activeStyle : {};
  const childrenStyle = isActive ? activeChildrenWrapperStyle : {};
  return (
    <>
      {isActive ? (
        <div css={style}>
          <p>Drop here</p>
        </div>
      ) : null}
      <div css={childrenStyle}>{children}</div>
    </>
  );
}
