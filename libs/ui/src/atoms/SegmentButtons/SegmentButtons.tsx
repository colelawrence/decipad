import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { cssVar, setCssVar } from '../../primitives';
import { hideOnPrint } from '../../styles/editor-layout';
import { Tooltip } from '../Tooltip/Tooltip';

interface SegmentButton {
  readonly children: ReactNode;
  readonly onClick: (event: React.MouseEvent<HTMLElement>) => void;
  readonly tooltip?: string;
  readonly testId?: string;
}

interface SegmentButtonsProps {
  readonly buttons: SegmentButton[];
}

export const SegmentButtons: FC<SegmentButtonsProps> = ({ buttons }) => {
  return (
    <div css={segmentButtonsStyles}>
      {buttons.map((button, i) => {
        const { children, onClick, tooltip, testId } = button;
        const hasTooltip = !!tooltip;
        const trigger = (
          <figure
            role="button"
            onClick={onClick}
            key={`figure-segment-${i}`}
            data-testid={`segment-button-trigger${testId ? `-${testId}` : ''}`}
            css={segmentButtonStyle}
          >
            {children}
          </figure>
        );
        return hasTooltip ? (
          <Tooltip side="top" trigger={trigger}>
            {tooltip}
          </Tooltip>
        ) : (
          trigger
        );
      })}
    </div>
  );
};

const segmentButtonsStyles = css(hideOnPrint, {
  display: 'flex',
  alignItems: 'center',
  borderRadius: '6px',
  padding: 1,
  border: `1px solid ${cssVar('borderColor')}`,
  backgroundColor: cssVar('tintedBackgroundColor'),
  '& figure:last-of-type': {
    borderLeft: `1px solid ${cssVar('borderHighlightColor')}`,
  },
  '& svg': {
    ...setCssVar('currentTextColor', cssVar('weakTextColor')),
    margin: '4px',
    width: '16px',
    height: '16px',
  },
});

const segmentButtonStyle = css({
  ':hover, :focus': {
    backgroundColor: cssVar('strongHighlightColor'),
    borderRadius: 4,
  },
});
