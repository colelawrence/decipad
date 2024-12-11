/* eslint decipad/css-prop-named-variable: 0 */
import { FC } from 'react';
import { grey500, p12Medium, p12Regular } from '../../../primitives';
import { Warning } from '../../../icons';
import { DropdownInput, Tooltip } from '../..';

export interface DropdownEditOptionProps {
  readonly value: string;
  readonly setValue: (a: string) => void;
  readonly error?: boolean;
}

export const DropdownEditOption = ({
  value,
  setValue,
  error = false,
}: DropdownEditOptionProps): ReturnType<FC> => {
  return (
    <DropdownInput
      autoFocus
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Type here"
      onClick={(e) => e.stopPropagation()}
      iconRight={
        error && (
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
        )
      }
    />
  );
};
