import { FC, ReactNode } from 'react';
import { css } from '@emotion/react';
import { cssVar } from '../../primitives';
import { Caret } from '../../icons';

const mainStyles = (readOnly: boolean, selected: boolean) =>
  css({
    width: '100%',
    maxWidth: '244px',
    borderRadius: 8,
    padding: '0px 6px 0px 8px',
    fontSize: 24,
    minHeight: 44,
    height: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'all 0.2s ease-in-out',
    ...(selected && { backgroundColor: cssVar('highlightColor') }),
    ...(!readOnly && {
      border: `1px solid ${cssVar('strongerHighlightColor')}`,
      ':hover': {
        backgroundColor: cssVar('highlightColor'),
      },
      cursor: 'pointer',
    }),
  });

const lineStyles = css({
  width: '100%',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  scrollSnapAlign: 'start',
  fontVariantNumeric: 'tabular-nums',
});

export interface WidgetDisplayProps {
  readonly openMenu: boolean;
  readonly setOpenMenu: (a: boolean) => void;
  readonly readOnly: boolean;
  readonly children: ReactNode;
}

export const WidgetDisplay: FC<WidgetDisplayProps> = ({
  openMenu,
  setOpenMenu,
  readOnly,
  children,
}) => {
  return (
    <div
      css={mainStyles(readOnly, openMenu)}
      onClick={() => !readOnly && setOpenMenu(!openMenu)}
    >
      <span css={lineStyles}>{children}</span>
      {!readOnly && (
        <div css={{ width: '20px' }}>
          <div css={{ width: 20, height: 20 }}>
            <Caret variant={openMenu ? 'up' : 'down'} color="normal" />
          </div>
        </div>
      )}
    </div>
  );
};
