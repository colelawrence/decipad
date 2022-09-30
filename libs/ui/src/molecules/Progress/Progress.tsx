import { css } from '@emotion/react';
import { FC } from 'react';
import { brand500, grey300, p12Bold } from '../../primitives';

const wrapper = css({
  width: '100%',
  backgroundColor: grey300.rgb,
  borderRadius: 16,
});

const progressStyles = css({
  height: 20,
  borderRadius: 16,
  backgroundColor: brand500.rgb,
  display: 'flex',
  justifyContent: 'end',
  alignItems: 'center',
  padding: '2px 6px 2px 0px',
  marginTop: 8,
  transition: 'width 0.5s',
});

export interface ProgressProps {
  readonly progress: number;
  readonly label?: string;
}

export const Progress: FC<ProgressProps> = ({ progress, label }) => {
  return (
    <div css={wrapper}>
      <div
        css={[
          {
            width: `${progress}%`,
          },
          progressStyles,
        ]}
      >
        <span css={p12Bold}>{label}</span>
      </div>
    </div>
  );
};
