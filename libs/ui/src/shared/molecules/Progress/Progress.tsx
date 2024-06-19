/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { FC } from 'react';
import { brand500, grey300, p12Medium } from '../../../primitives';

const wrapper = css({
  width: '100%',
  height: '100%',
  backgroundColor: grey300.rgb,
  borderRadius: 16,
});

const progressStyles = css({
  minWidth: 25,
  height: '100%',
  borderRadius: 16,
  backgroundColor: brand500.rgb,
  display: 'flex',
  justifyContent: 'end',
  alignItems: 'center',
  marginTop: 8,
  transition: 'width 0.5s',
});

export type ProgressProps = Readonly<{
  progress: number;
  label?: string;
}>;

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
        <span css={p12Medium}>{label}</span>
      </div>
    </div>
  );
};
