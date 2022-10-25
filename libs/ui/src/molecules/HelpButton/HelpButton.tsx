import { css } from '@emotion/react';
import { QuestionMark } from '../../icons';
import { cssVar, p13Medium } from '../../primitives';
import { Tooltip } from '../../atoms';

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

  'button:hover > &': {
    backgroundColor: cssVar('strongHighlightColor'),
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
