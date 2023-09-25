/* eslint decipad/css-prop-named-variable: 0 */
import { Result } from '@decipad/language';
import { noop } from '@decipad/utils';
import { Meta, StoryFn } from '@storybook/react';
import { ComponentProps } from 'react';
import { withCode } from '../../storybook-utils';
import { DisplayWidget } from './DisplayWidget';

const args: ComponentProps<typeof DisplayWidget> = {
  openMenu: true,
  onChangeOpen: noop,
  result: 'Result',
  readOnly: false,
  children: [],
  allResults: [],
};

export default {
  title: 'Organisms / Editor / Result Widget / Result Widget',
  component: DisplayWidget,
  decorators: [withCode('100000000')],
  args,
} as Meta;

export const Normal: StoryFn<
  ComponentProps<typeof DisplayWidget> & Result.Result
> = ({ type, value, ...props }) => {
  return (
    <div css={{ maxWidth: 300, maxHeight: 200, padding: 32 }}>
      <DisplayWidget
        {...props}
        lineResult={{
          type: 'computer-result',
          id: 'id',
          result: {
            type,
            value,
          },
          epoch: 1n,
        }}
      />
    </div>
  );
};
