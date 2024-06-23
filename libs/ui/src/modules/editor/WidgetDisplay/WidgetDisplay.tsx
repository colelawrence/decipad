/* eslint decipad/css-prop-named-variable: 0 */
import type { Result } from '@decipad/language-interfaces';
import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { CaretDown, CaretUp } from '../../../icons';
import { CodeResult } from '../CodeResult/CodeResult';
import { cssVar, p24Medium } from '../../../primitives';

const mainStyles = (readOnly: boolean, selected: boolean) =>
  css(p24Medium, {
    width: '100%',
    maxWidth: '244px',
    borderRadius: 8,
    padding: '0px 6px 0px 8px',
    fontSize: 24,
    minHeight: 40,
    height: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'all 0.2s ease-in-out',
    ...(selected && { backgroundColor: cssVar('backgroundDefault') }),
    ...(!readOnly && {
      border: `1px solid ${cssVar('borderSubdued')}`,
      ':hover': {
        backgroundColor: cssVar('backgroundDefault'),
      },
      cursor: 'pointer',
    }),
  });

const lineStyles = css({
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  scrollSnapAlign: 'start',
  fontVariantNumeric: 'tabular-nums',
});

export interface WidgetDisplayProps {
  readonly openMenu: boolean;
  readonly setOpenMenu: (a: boolean) => void;
  readonly readOnly: boolean;
  readonly allowOpen: boolean;
  readonly children: ReactNode;
  readonly result?: Result.Result;
}

export const WidgetDisplay: FC<WidgetDisplayProps> = ({
  openMenu,
  setOpenMenu,
  readOnly,
  allowOpen,
  children,
  result,
}) => {
  const showMenu = !readOnly || allowOpen;
  return (
    <div
      css={mainStyles(!allowOpen && readOnly, openMenu)}
      onClick={() => showMenu && setOpenMenu(!openMenu)}
      data-testid="dropdown-display"
    >
      {result ? (
        <span css={lineStyles}>
          <CodeResult value={result.value} type={result.type} />
        </span>
      ) : (
        <span css={lineStyles}>{children}</span>
      )}
      {showMenu && (
        <div css={{ width: '20px' }}>
          <div css={{ width: 20, height: 20 }}>
            {openMenu ? <CaretUp /> : <CaretDown />}
          </div>
        </div>
      )}
    </div>
  );
};
