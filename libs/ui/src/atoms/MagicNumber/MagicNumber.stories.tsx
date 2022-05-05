import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import { withCode } from '../../storybook-utils';
import { MagicNumber } from './MagicNumber';

export default {
  title: 'Atoms / Editor / Results / Inline / Magic Number',
  component: MagicNumber,
  decorators: [
    (St) => (
      <div style={{ margin: '5px' }}>
        We need 500g (or <St /> in 🇺🇸) of butter for this recipe.
      </div>
    ),
  ],
} as Meta;

export const Normal: Story<ComponentProps<typeof MagicNumber>> = (props) => (
  <MagicNumber {...props} />
);
Normal.decorators = [withCode('17.64 ounces', true)];

export const Formatted: Story<ComponentProps<typeof MagicNumber>> = (props) => (
  <MagicNumber {...props} />
);
Formatted.decorators = [withCode('10000', true)];

export const Decimal: Story<ComponentProps<typeof MagicNumber>> = (props) => (
  <MagicNumber {...props} />
);
Decimal.decorators = [withCode('0.1', true)];

export const Unit: Story<ComponentProps<typeof MagicNumber>> = (props) => (
  <MagicNumber {...props} />
);
Unit.decorators = [withCode('1 banana + 1 banana', true)];

export const LongDecimal: Story<ComponentProps<typeof MagicNumber>> = (
  props
) => <MagicNumber {...props} />;
LongDecimal.decorators = [withCode('0.123456789123456789', true)];

export const Boolean: Story<ComponentProps<typeof MagicNumber>> = (props) => (
  <MagicNumber {...props} />
);
Boolean.decorators = [withCode('true', true)];

export const List: Story<ComponentProps<typeof MagicNumber>> = (props) => (
  <MagicNumber {...props} />
);
List.decorators = [withCode('[1,2,3]', true)];

export const Simple: Story<ComponentProps<typeof MagicNumber>> = (props) => (
  <MagicNumber {...props} />
);
Simple.decorators = [withCode('10', true)];
