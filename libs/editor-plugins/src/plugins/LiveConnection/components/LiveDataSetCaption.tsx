import { cssVar, p10Medium, p8Medium } from '@decipad/ui';
import { css } from '@emotion/react';
import { Zap } from 'libs/ui/src/icons';
import { FC, PropsWithChildren } from 'react';

type LiveDataSetCaptionProps = PropsWithChildren<{
  source?: string;
}>;

const wrapperStyles = css({
  backgroundColor: cssVar('tintedBackgroundColor'),
  display: 'flex',
  marginTop: '2px',
  height: '24px',
  border: `1px solid ${cssVar('borderColor')}`,
  borderRadius: '6px',
  paddingLeft: '3px',
  paddingRight: '3px',
});

const iconStyles = css({
  ...p8Medium,
  backgroundColor: cssVar('liveDataBackgroundColor'),
  display: 'flex',
  margin: '4px',
  padding: '3px 4px',
  '> svg': {
    width: '8px',
    height: '8px',
  },
  borderRadius: '6px',
});

const sourceStyles = css({
  ...p10Medium,
  height: '24px',
  lineHeight: '23px',
  paddingLeft: '3px',
});

const LiveDataSetCaption: FC<LiveDataSetCaptionProps> = ({ source = '' }) => {
  return (
    <div css={wrapperStyles} contentEditable={false}>
      <div css={iconStyles}>
        <Zap />
        <span>LIVE</span>
      </div>
      <div css={sourceStyles}>{source.toUpperCase()}</div>
    </div>
  );
};

// use export default for React.lazy
export default LiveDataSetCaption;
