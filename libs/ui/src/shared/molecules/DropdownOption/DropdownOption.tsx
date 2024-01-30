/* eslint decipad/css-prop-named-variable: 0 */
import { FC } from 'react';
import { css } from '@emotion/react';
import {
  cssVar,
  grey500,
  p12Medium,
  p12Regular,
  p13Medium,
} from '../../../primitives';
import { Warning } from '../../../icons';
import { Tooltip } from '../..';

const wrapperStyles = css({
  paddingRight: '6px',
  display: 'flex',
  alignItems: 'center',
  backgroundColor: cssVar('backgroundDefault'),
  borderRadius: '6px',
});

const inputOptionStyles = css(p13Medium, {
  marginTop: '2px',
  padding: '6px 6px 6px 8px',
  width: '100%',
  height: '32px',
  backgroundColor: cssVar('backgroundDefault'),
  borderRadius: '6px',
  display: 'flex',
  alignItems: 'center',
});

export interface DropdownAddOptionProps {
  readonly value: string;
  readonly setValue: (a: string) => void;
  readonly error?: boolean;
}

export const DropdownOption = ({
  value,
  setValue,
  error = false,
}: DropdownAddOptionProps): ReturnType<FC> => {
  return (
    <div css={wrapperStyles}>
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type here"
        css={inputOptionStyles}
        onClick={(e) => e.stopPropagation()}
      />
      {error && (
        <Tooltip
          trigger={
            <div css={{ width: 16, height: 16 }}>
              <Warning />
            </div>
          }
        >
          <p css={p12Medium}>
            <strong>Option already exists</strong>
          </p>
          <p css={[p12Regular, { color: grey500.rgb }]}>
            Specify another option
          </p>
        </Tooltip>
      )}
    </div>
  );
};
