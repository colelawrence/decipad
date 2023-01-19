import { css } from '@emotion/react';
import { useContext } from 'react';
import { ClientEventsContext } from '@decipad/client-events';
import { Tooltip } from '../../atoms';
import { QuestionMark } from '../../icons';
import { cssVar, p13Bold } from '../../primitives';

const styles = css(p13Bold, {
  boxShadow: `0px 2px 24px -4px rgba(36, 36, 41, 0.06)`,
  borderRadius: '6px',
  padding: '0px 8px 0px 10px',

  backgroundColor: cssVar('buttonHoverBackground'),
  ':hover': {
    backgroundColor: cssVar('buttonHoverBackgroundHover'),
  },

  fontWeight: 900,
});

const innerStyles = css(p13Bold, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: cssVar('normalTextColor'),

  borderRadius: '6px',
  height: '32px',
  gap: '6px',

  '> svg': {
    width: '12px',
    height: '12px',
  },
});

export const HelpButton = (): ReturnType<React.FC> => {
  const clientEvent = useContext(ClientEventsContext);
  return (
    <span id="HelpButton">
      <Tooltip
        trigger={
          <button
            css={styles}
            onClick={() =>
              clientEvent({
                type: 'action',
                action: 'help button clicked',
              })
            }
          >
            <span css={innerStyles}>
              <QuestionMark /> <span>Help</span>
            </span>
          </button>
        }
        align="end"
      >
        Help and resources ✨
      </Tooltip>
    </span>
  );
};
