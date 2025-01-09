/* eslint decipad/css-prop-named-variable: 0 */
import type { Result } from '@decipad/language-interfaces';
import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { CaretDown, CaretUp } from '../../../icons';
import { CodeResult } from '../CodeResult/CodeResult';
import { cssVar, p24Medium } from '../../../primitives';
import { AvailableSwatchColor } from '@decipad/editor-types';
import { useSwatchColor } from 'libs/ui/src/utils';

const mainStyles = (readOnly: boolean, selected: boolean) =>
  css(p24Medium, {
    width: '100%',
    flex: 0,
    borderRadius: 8,
    padding: '0px 6px',
    fontSize: 24,
    minHeight: 40,
    height: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'all 0.2s ease-in-out',
    ...(selected && { backgroundColor: cssVar('backgroundHeavy') }),
    ...(!readOnly && {
      border: `1px solid ${cssVar('borderSubdued')}`,
      ':hover': {
        backgroundColor: cssVar('backgroundHeavy'),
      },
      cursor: 'pointer',
    }),
    overflow: 'hidden',
  });

const lineStyles = css({
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  flexGrow: 1,
  scrollSnapAlign: 'start',
  textAlign: 'start',
});

export interface WidgetDisplayProps {
  readonly openMenu: boolean;
  readonly setOpenMenu: (a: boolean) => void;
  readonly readOnly: boolean;
  readonly allowOpen: boolean;
  readonly children: ReactNode;
  readonly result?: Result.Result;
  readonly color?: AvailableSwatchColor;
}

export const WidgetDisplay: FC<WidgetDisplayProps> = ({
  openMenu,
  setOpenMenu,
  readOnly,
  allowOpen,
  children,
  result,
  color: colorProp = 'Catskill',
}) => {
  const showMenu = !readOnly || allowOpen;
  const swatchColor = useSwatchColor(colorProp, 'vivid', 'base');
  return (
    <div
      css={mainStyles(!allowOpen && readOnly, openMenu)}
      onClick={() => showMenu && setOpenMenu(!openMenu)}
      data-testid="dropdown-display"
    >
      {result ? (
        <span css={lineStyles}>
          <CodeResult
            value={result.value}
            type={result.type}
            meta={result.meta}
          />
        </span>
      ) : (
        <span
          css={[
            lineStyles,
            {
              color: swatchColor.hex,
            },
          ]}
        >
          {children}
        </span>
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
