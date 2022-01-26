import { css } from '@emotion/react';
import Tippy, { TippyProps } from '@tippyjs/react';
import { DefaultPlatePluginKey, withDraggables } from '@udecode/plate';
import { GrDrag } from 'react-icons/gr';
import { PlateComponent } from '../types';
import {
  ELEMENT_FETCH,
  ELEMENT_H2,
  ELEMENT_PARAGRAPH,
  ELEMENT_BLOCKQUOTE,
  ELEMENT_H3,
  ELEMENT_UL,
  ELEMENT_OL,
  ELEMENT_CODE_BLOCK,
  ELEMENT_TABLE_INPUT,
} from '../elements';

const GrabberTooltipContent = () => (
  <div style={{ fontSize: 12, textAlign: 'center' }}>
    <div>
      Drag <span style={{ color: 'rgba(0, 0, 0, 0.45)' }}>to move</span> <br />
    </div>
  </div>
);

export const grabberTooltipProps: TippyProps = {
  content: <GrabberTooltipContent />,
  placement: 'left',
  arrow: false,
  offset: [0, 8],
  delay: [500, 0],
  duration: [0, 0],
  hideOnClick: true,
  theme: 'light',
};

const iconStyles = css({
  width: 18,
  height: 18,
  opacity: 0.3,
  transition: 'opacity 0.2s ease-out',
  '&:hover': {
    opacity: 1,
  },
});

export const withStyledDraggables = (
  components: Partial<Record<DefaultPlatePluginKey, PlateComponent>>
): Partial<Record<DefaultPlatePluginKey, PlateComponent>> => {
  return withDraggables(components, [
    {
      keys: [ELEMENT_PARAGRAPH],
      level: 0,
    },
    {
      keys: [
        ELEMENT_PARAGRAPH,
        ELEMENT_BLOCKQUOTE,
        ELEMENT_H2,
        ELEMENT_H3,
        ELEMENT_UL,
        ELEMENT_OL,
        ELEMENT_CODE_BLOCK,
        ELEMENT_FETCH,
        ELEMENT_TABLE_INPUT,
      ],
      onRenderDragHandle: ({ className, styles }) => {
        return (
          <Tippy {...grabberTooltipProps}>
            <button type="button" className={className} css={styles}>
              <GrDrag css={iconStyles} />
            </button>
          </Tippy>
        );
      },
    },
    {
      key: ELEMENT_H2,
      styles: {
        gutterLeft: {
          padding: '16px 8px 0 0',
        },
      },
    },
    {
      key: ELEMENT_H3,
      styles: {
        gutterLeft: {
          padding: '14px 8px 0 0',
        },
      },
    },
    {
      key: ELEMENT_TABLE_INPUT,
      styles: {
        gutterLeft: {
          padding: '16px 8px 0 0',
        },
      },
    },
    {
      keys: [ELEMENT_PARAGRAPH],
      styles: {
        gutterLeft: {
          padding: '8px 8px 0 0',
        },
      },
    },
    {
      key: ELEMENT_BLOCKQUOTE,
      styles: {
        gutterLeft: {
          padding: '28px 8px 0 0',
        },
      },
    },
    {
      key: ELEMENT_CODE_BLOCK,
      styles: {
        gutterLeft: {
          padding: '42px 8px 0 0',
        },
      },
    },
    {
      key: ELEMENT_FETCH,
      styles: {
        gutterLeft: {
          padding: '42px 8px 0 0',
        },
      },
    },
  ]);
};
