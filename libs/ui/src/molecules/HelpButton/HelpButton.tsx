import { css } from '@emotion/react';
import { Info } from '../../icons';
import { cssVar, setCssVar } from '../../primitives';
import { Anchor } from '../../utils';

const styles = css({
  width: '38px',
  height: '40px',
  display: 'grid',
  justifyContent: 'center',
  alignContent: 'center',

  border: `1px solid ${cssVar('highlightColor')}`,
  borderRadius: '8px',
  backgroundColor: cssVar('backgroundColor'),
  ...setCssVar('currentTextColor', cssVar('strongTextColor')),
});
const innerStyles = css({
  width: '32px',
  height: '32px',
  display: 'grid',
  padding: '8px',

  borderRadius: '8px',
  '*:hover > &, *:focus &': {
    backgroundColor: cssVar('highlightColor'),
  },
});

export const HelpButton = (): ReturnType<React.FC> => {
  return (
    <Anchor
      aria-label="Help"
      href="https://www.notion.so/decipad/What-is-Deci-d140cc627f1e4380bb8be1855272f732"
      css={styles}
    >
      <span css={innerStyles}>
        <Info />
      </span>
    </Anchor>
  );
};
