import { PropsWithChildren } from 'react';
import { cssVar } from '../../primitives';

export const CodeLineFloat: React.FC<
  PropsWithChildren<{ offsetTop: number }>
> = ({ children, offsetTop }) => (
  <div
    css={{
      pointerEvents: 'all',
      position: 'absolute',
      left: 0,
      top: `${offsetTop}px`,
      width: '100%',
      zIndex: 10,
      marginTop: '2px',

      cursor: 'initial',

      borderRadius: '12px',
      backgroundColor: cssVar('tintedBackgroundColor'),
    }}
    onClick={(ev) => {
      ev.stopPropagation();
    }}
  >
    {children}

    <div
      css={{
        height: '36px',
        fontSize: '12px',
        fontWeight: 500,

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',

        padding: '0 12px',
      }}
    >
      <div css={{ width: '1.5rem' }}></div>
      <div>Close with ESC or ENTER</div>
    </div>
  </div>
);
