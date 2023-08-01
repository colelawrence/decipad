import { cssVar, p10Medium, yellow400 } from '@decipad/ui';
import { css } from '@emotion/react';
import { FC, PropsWithChildren } from 'react';

type LiveDataSetCaptionProps = PropsWithChildren<{
  source?: string;
}>;

const wrapperStyles = css({
  backgroundColor: cssVar('backgroundSubdued'),
  marginTop: '2px',
  height: '21px',
  border: `1px solid ${yellow400.hex}`,
  borderRadius: '6px',
  paddingLeft: '10px',
  paddingRight: '3px',
  marginLeft: '-10px',
  zIndex: -1,
});

const sourceStyles = css({
  ...p10Medium,
  lineHeight: '22px',
  paddingLeft: '3px',
});

const LiveDataSetCaption: FC<LiveDataSetCaptionProps> = ({ source = '' }) => {
  return (
    <div css={wrapperStyles} contentEditable={false}>
      <div css={sourceStyles}>{source.toUpperCase()}</div>
    </div>
  );
};

// use export default for React.lazy
export default LiveDataSetCaption;
