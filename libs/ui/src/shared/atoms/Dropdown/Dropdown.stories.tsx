/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { Meta, StoryFn } from '@storybook/react';
import { cssVar } from 'libs/ui/src/primitives';
import { InputField } from '../InputField/InputField';
import { Dropdown } from './Dropdown';

export default {
  title: 'Atoms / UI / Dropdown',
  component: Dropdown,
} as Meta;

const sidebarSearchBoxStyles = css({
  display: 'flex',
  height: 32,
  padding: '6px 12px 6px 6px',
  alignItems: 'center',
  width: '100%',
  gap: 6,
  borderRadius: 6,
  border: `1px solid ${cssVar('borderSubdued')}`,
  backgroundColor: cssVar('backgroundMain'),
  color: cssVar('textSubdued'),
  input: {
    borderRadius: 0,
    border: 0,
    padding: 0,
    borderTop: `1px solid ${cssVar('borderSubdued')}`,
    borderBottom: `1px solid ${cssVar('borderSubdued')}`,
  },
  '.input-field-container': {
    width: '100%',
  },
});

export const InsideInput: StoryFn = () => (
  <div css={sidebarSearchBoxStyles}>
    <InputField value={'Hello'} size="small"></InputField>
    <Dropdown
      selection="one"
      possibleSelections={[{ label: 'one', description: 'numero uno' }]}
    ></Dropdown>
  </div>
);

export const NormalJustAtom: StoryFn = () => (
  <Dropdown
    selection="one"
    possibleSelections={[{ label: 'one', description: 'numero uno' }]}
  ></Dropdown>
);

export const Disabled: StoryFn = () => (
  <Dropdown
    selection="one"
    possibleSelections={[{ label: 'one', description: 'numero uno' }]}
    disable={true}
  ></Dropdown>
);

export const WithRemove: StoryFn = () => (
  <Dropdown
    selection="one"
    onRemove={() => 1}
    possibleSelections={[{ label: 'one', description: 'numero uno' }]}
  ></Dropdown>
);
