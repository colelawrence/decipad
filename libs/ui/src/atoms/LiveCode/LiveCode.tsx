import { css } from '@emotion/react';
import { ReactNode } from 'react';
import { Tooltip } from '..';
import { Bolt } from '../../icons';
import { cssVar, p10Medium, p12Medium, setCssVar } from '../../primitives';
import { CodeError } from '../CodeError/CodeError';

type LiveCodeProps = {
  readonly children?: ReactNode;
  readonly error?: Error;
  readonly text?: string;
};

export const LiveCode = ({ children, text, error }: LiveCodeProps) => {
  const nonErrorTooltip = (
    <Tooltip
      hoverOnly
      trigger={
        // eslint-disable-next-line decipad/css-prop-named-variable
        <span css={{ cursor: 'pointer' }}>
          <Bolt />
        </span>
      }
    >
      <p>Live code result</p>
    </Tooltip>
  );
  return (
    <div css={liveCodeWrapperStyles}>
      <div css={liveInputStyles}>{children}</div>
      <div css={labelStyles} contentEditable="false">
        <span css={liveIconStyles}>
          {error ? <CodeError message={error.message} /> : nonErrorTooltip}
        </span>
        <span css={liveSpanStyles}>{text || 'LIVE CODE'}</span>
      </div>
    </div>
  );
};

const liveCodeWrapperStyles = css({
  display: 'flex',
  gap: 2,
  backgroundColor: cssVar('highlightColor'),
  padding: '2px 2px 2px 6px',
  width: 'fit-content',
  marginBottom: 8,
  borderRadius: 6,
  margin: 'auto 0',
});

const liveInputStyles = css(p12Medium, {
  display: 'flex',
  padding: '0px 4px',
  alignItems: 'center',
  color: cssVar('normalTextColor'),
});
const labelStyles = css(p10Medium, {
  display: 'flex',
  color: cssVar('liveDataIconDarkStrokeColor'),
  backgroundColor: cssVar('liveDataWeakBackgroundColor'),
  borderRadius: 4,
  alignItems: 'center',
  padding: 2,
  cursor: 'default',
  gap: 1,
});

const liveIconStyles = css({
  svg: {
    ...setCssVar('currentTextColor', cssVar('liveDataIconDarkStrokeColor')),
    ...setCssVar('iconBackgroundColor', cssVar('liveDataWeakBackgroundColor')),
    height: 16,
    width: 16,
  },
  ':hover': {
    backgroundColor: cssVar('liveDataIconStrokeColor'),
    borderRadius: 3,
    svg: {
      ...setCssVar('iconBackgroundColor', cssVar('liveDataIconStrokeColor')),
    },
  },
});

const liveSpanStyles = css({
  paddingRight: 2,
  textTransform: 'uppercase',
});
