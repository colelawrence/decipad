import { css } from '@emotion/react';
import { Tooltip } from '../../atoms';
import { QuestionMark } from '../../icons';
import {
  cssVar,
  offBlack,
  p13Medium,
  transparency,
  weakOpacity,
} from '../../primitives';

const styles = css(p13Medium, {
  boxShadow: `0px 2px 24px -4px rgba(36, 36, 41, 0.06)`,
  border: `1px solid ${cssVar('strongHighlightColor')}`,
  borderRadius: '8px',
  padding: '4px',

  backgroundColor: cssVar('backgroundColor'),

  fontWeight: 900,
});

const innerStyles = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  borderRadius: '6px',
  height: '32px',
  width: '32px',
  backgroundColor: cssVar('highlightColor'),

  'button:hover > &': {
    boxShadow: `inset 0 0 0 1px ${transparency(offBlack, weakOpacity).rgba}`,
  },

  '> svg': {
    width: '16px',
    height: '16px',
  },
});

export const HelpButton = (): ReturnType<React.FC> => {
  return (
    <Tooltip
      trigger={
        <button css={styles}>
          <span css={innerStyles}>
            <QuestionMark />
          </span>
        </button>
      }
      align="end"
    >
      Help and resources ✨
    </Tooltip>
  );
};
