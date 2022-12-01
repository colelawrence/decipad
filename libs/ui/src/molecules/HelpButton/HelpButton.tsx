import { css } from '@emotion/react';
import { Tooltip } from '../../atoms';
import { QuestionMark } from '../../icons';
import {
  cssVar,
  p13Medium,
  strongOpacity,
  sun500,
  transparency,
} from '../../primitives';

const styles = css(p13Medium, {
  boxShadow: `0px 2px 24px -4px rgba(36, 36, 41, 0.06)`,
  border: `1px solid ${cssVar('strongHighlightColor')}`,
  borderRadius: '8px',
  padding: '4px',

  backgroundColor: cssVar('highlightColor'),

  fontWeight: 900,

  '&:hover': {
    boxShadow: `1px -1px 1px ${transparency(sun500, strongOpacity).rgba}`,
  },
});

const innerStyles = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  borderRadius: '6px',
  height: '32px',
  width: '32px',
  backgroundColor: cssVar('highlightColor'),

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
