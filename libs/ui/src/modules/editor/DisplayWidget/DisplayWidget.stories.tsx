/* eslint decipad/css-prop-named-variable: 0 */
import { Result } from '@decipad/remote-computer';
import { noop } from '@decipad/utils';
import { Meta, StoryFn } from '@storybook/react';
import { withCode } from '../../../storybook-utils';
import { DisplayWidget, DisplayWidgetDropdownProps } from './DisplayWidget';

const args: DisplayWidgetDropdownProps = {
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

export const Normal: StoryFn<DisplayWidgetDropdownProps & Result.Result> = ({
  type,
  value,
  meta,
  ...props
}: DisplayWidgetDropdownProps & Result.Result) => {
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
            meta,
          },
          epoch: 1n,
        }}
      />
    </div>
  );
};
