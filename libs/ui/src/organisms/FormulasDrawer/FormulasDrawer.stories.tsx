import { SerializedType } from '@decipad/language';
import { docs } from '@decipad/routing';
import { Meta, StoryFn } from '@storybook/react';
import { CodeLine } from '..';
import { FormulasDrawer } from './FormulasDrawer';

const lines = [
  {
    syntaxError: {
      message: 'SyntaxError',
      url: docs({}).$,
    },
  },
  {
    displayExpanded: true,
    open: true,
    result: {
      value: ['Lorem', 'Ipsum', 'Dolor', 'Sit', 'Amet'],
      type: {
        kind: 'column',
        cellType: { kind: 'string' },
        indexedBy: null,
      } as SerializedType,
    },
  },
];

export default {
  title: 'Organisms / Editor / Table / FormulasDrawer',
  component: FormulasDrawer,
} as Meta;

export const Normal: StoryFn = () => (
  <FormulasDrawer>
    <CodeLine {...lines[0]}>42 + 1337;</CodeLine>
    <CodeLine {...lines[1]}>
      ["Lorem", "Ipsum", "Dolor", "Sit", "Amet"]
    </CodeLine>
  </FormulasDrawer>
);
