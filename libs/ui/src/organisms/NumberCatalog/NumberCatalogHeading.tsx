/* eslint decipad/css-prop-named-variable: 0 */
import { useThemeFromStore } from '@decipad/react-contexts';
import { css } from '@emotion/react';
import { ArrowDiagonalTopRight, Heading1, Heading2 } from '../../icons';
import {
  black,
  p14Medium,
  transparency,
  weakOpacity,
  white,
} from '../../primitives';

interface NumberCatalogHeadingProps {
  headingLevel: 2 | 3;
  blockId: string;
  name: string;
}

export const NumberCatalogHeading = ({
  headingLevel,
  blockId,
  name,
}: NumberCatalogHeadingProps) => {
  const [darkTheme] = useThemeFromStore();
  return (
    <a
      href={`#${blockId}`}
      onClick={(ev) => {
        ev.preventDefault();
        window.history.pushState(null, '', `#${blockId}`);
        window.dispatchEvent(new Event('hashchange'));
      }}
    >
      <span css={numberCatalogListStyles(darkTheme)}>
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
          <span>{headingLevel === 2 ? <Heading1 /> : <Heading2 />}</span>

          <span
            css={css({
              position: 'relative',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
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
              borderRadius: '4px',
              padding: '4px',
              height: '20px',
              width: '20px',
              display: 'inline-flex',
              backgroundColor: transparency(
                darkTheme ? white : black,
                weakOpacity
              ).rgba,
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

export const numberCatalogListStyles = (darkTheme: boolean) =>
  css(p14Medium, {
    padding: '11px 0px 9px 15px',
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 24px',
    alignItems: 'center',
    gap: '8px',
    cursor: 'grab',
    minWidth: 0,
    minHeight: 0,
    '*:hover > &': {
      backgroundColor: transparency(darkTheme ? black : white, 0.5).rgba,
      'span:last-child span:last-child': {
        opacity: 1,
        cursor: 'pointer',
      },
    },
  });
