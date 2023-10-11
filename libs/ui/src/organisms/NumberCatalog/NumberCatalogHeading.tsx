/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { ArrowDiagonalTopRight } from '../../icons';
import { cssVar, p14Medium } from '../../primitives';

interface NumberCatalogHeadingProps {
  blockId: string;
  name: string;
}

export const NumberCatalogHeading = ({
  blockId,
  name,
}: NumberCatalogHeadingProps) => {
  // #h{id} is because of css query selectors, dont remove the h
  const cssSelector = `#h${blockId}`;
  return (
    <a
      href={cssSelector}
      onClick={(ev) => {
        ev.preventDefault();
        window.history.pushState(null, '', cssSelector);
        window.dispatchEvent(new Event('hashchange'));
      }}
      data-testid="number-catalog-link"
    >
      <span css={numberCatalogListStyles}>
        <span
          css={css({
            display: 'inline-flex',
            gap: '6px',
            alignItems: 'center',
            svg: {
              width: '16px',
              height: '16px',
            },
          })}
        >
          <span
            css={css({
              position: 'relative',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              color: cssVar('textSubdued'),
              minWidth: 0,
            })}
          >
            {name}
          </span>
        </span>
        <span>
          <span
            css={css({
              opacity: 0,
              padding: '5px 4px 3px',
              height: '20px',
              width: '20px',
              display: 'inline-flex',
              color: 'black',
              svg: {
                width: '12px',
                height: '12px',
              },
            })}
          >
            <ArrowDiagonalTopRight />
          </span>
        </span>
      </span>
    </a>
  );
};

export const numberCatalogListStyles = css(p14Medium, {
  padding: '4px 0px 4px 8px',
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) 20px',
  alignItems: 'center',
  gap: '8px',
  cursor: 'grab',
  minWidth: 0,
  minHeight: 0,
  '*:hover > &': {
    'span:last-child span:last-child': {
      opacity: 1,
      cursor: 'pointer',
    },
  },
});
