import { css } from '@emotion/react';
import { useContext } from 'react';
import { ClientEventsContext } from '@decipad/client-events';
import { Tooltip } from '../../atoms';
import { QuestionMark } from '../../icons';
import { cssVar, p14Medium } from '../../primitives';

const styles = css(p14Medium, {
  boxShadow: `0px 2px 24px -4px rgba(36, 36, 41, 0.06)`,
  border: `1px solid ${cssVar('strongHighlightColor')}`,
  borderRadius: '8px',
  padding: '5px 15px',
  color: cssVar('backgroundColor'),

  backgroundColor: cssVar('strongTextColor'),

  fontWeight: 900,
});

const innerStyles = css(p14Medium, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: cssVar('backgroundColor'),

  borderRadius: '8px',
  height: '32px',
  gap: '6px',
  backgroundColor: cssVar('strongTextColor'),

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
