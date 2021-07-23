import styled from '@emotion/styled';
import Tippy, { TippyProps } from '@tippyjs/react';
import {
  ELEMENT_BLOCKQUOTE,
  ELEMENT_CODE_BLOCK,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_IMAGE,
  ELEMENT_OL,
  ELEMENT_PARAGRAPH,
  ELEMENT_TODO_LI,
  ELEMENT_UL,
  withDraggables,
} from '@udecode/slate-plugins';
import { GrDrag } from 'react-icons/gr';

const GrabberTooltipContent = () => (
  <div style={{ fontSize: 12, textAlign: 'center' }}>
    <div>
      Drag <span style={{ color: 'rgba(0, 0, 0, 0.45)' }}>to move</span> <br />{' '}
      Click <span style={{ color: 'rgba(0, 0, 0, 0.45)' }}>for options</span>
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

const Icon = styled(GrDrag)({
  width: 18,
  height: 18,
  opacity: 0.3,
  transition: 'opacity 0.2s ease-out',
  '&:hover': {
    opacity: 1,
  },
});

export const withStyledDraggables = (components: any) => {
  return withDraggables(components, [
    {
      keys: [ELEMENT_PARAGRAPH, ELEMENT_UL, ELEMENT_OL],
      level: 0,
    },
    {
      keys: [
        ELEMENT_PARAGRAPH,
        ELEMENT_BLOCKQUOTE,
        ELEMENT_TODO_LI,
        ELEMENT_H2,
        ELEMENT_H3,
        ELEMENT_IMAGE,
        ELEMENT_OL,
        ELEMENT_UL,
        ELEMENT_CODE_BLOCK,
      ],
      onRenderDragHandle: ({ className, styles }) => {
        return (
          <Tippy {...grabberTooltipProps}>
            <button
              type="button"
              className={className}
              style={{ ...styles[0] }}
            >
              <Icon />
            </button>
          </Tippy>
        );
      },
    },
    {
      key: ELEMENT_H2,
      styles: {
        gutterLeft: {
          padding: '32px 8px 0 0',
        },
      },
    },
    {
      key: ELEMENT_H3,
      styles: {
        gutterLeft: {
          padding: '16px 8px 0 0',
        },
      },
    },
    {
      keys: [ELEMENT_PARAGRAPH, ELEMENT_UL, ELEMENT_OL],
      styles: {
        gutterLeft: {
          padding: '12px 8px 0 0',
        },
      },
    },
    {
      key: ELEMENT_BLOCKQUOTE,
      styles: {
        gutterLeft: {
          padding: '12px 8px 0 0',
        },
      },
    },
    {
      key: ELEMENT_CODE_BLOCK,
      styles: {
        gutterLeft: {
          padding: '36px 8px 0 0',
        },
      },
    },
  ]);
};
