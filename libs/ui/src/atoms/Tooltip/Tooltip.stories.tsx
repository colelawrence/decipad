/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { Meta, StoryFn } from '@storybook/react';
import { cssVar } from '../../primitives';
import { Tooltip } from './Tooltip';

const args = {
  children: 'Tooltip text',
};

export default {
  title: 'Atoms / UI / Tooltip',
  component: Tooltip,
  args,
} as Meta;

export const Normal: StoryFn<typeof args> = (props) => (
  <Tooltip
    {...props}
    trigger={
      <div
        css={css({
          color: cssVar('textHeavy'),
          textAlign: 'center',
        })}
      >
        Hover me
      </div>
    }
  />
);

export const Small: StoryFn<typeof args> = (props) => (
  <Tooltip
    {...props}
    variant="small"
    trigger={
      <div
        css={css({
          color: cssVar('textHeavy'),
          textAlign: 'center',
        })}
      >
        Hover me, I'm smol
      </div>
    }
  />
);
