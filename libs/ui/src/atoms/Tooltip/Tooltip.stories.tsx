import { css } from '@emotion/react';
import { Meta, Story } from '@storybook/react';
import { cssVar } from '../../primitives';
import { Tooltip } from './Tooltip';

const args = {
  children: 'Tooltip text',
};

export default {
  title: 'Atoms / UI / Tooltip',
  component: Tooltip,
  parameters: {
    chromatic: { disable: true },
  },
  args,
} as Meta;

export const Normal: Story<typeof args> = (props) => (
  <Tooltip
    {...props}
    trigger={
      <div
        css={css({
          color: cssVar('strongTextColor'),
          textAlign: 'center',
        })}
      >
        Hover me
      </div>
    }
  />
);

export const Small: Story<typeof args> = (props) => (
  <Tooltip
    {...props}
    variant="small"
    trigger={
      <div
        css={css({
          color: cssVar('strongTextColor'),
          textAlign: 'center',
        })}
      >
        Hover me, I'm smol
      </div>
    }
  />
);
