/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { Meta, Story } from '@storybook/react';
import { ComponentProps } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { p16Regular } from '../../primitives';
import { DragAndDropImportNotebook } from './DragAndDropImportNotebook';

export default {
  title: 'Organisms / UI / Workspace / Drag Import Notebook',
  component: DragAndDropImportNotebook,
} as Meta;

export const Normal: Story<ComponentProps<typeof DragAndDropImportNotebook>> = (
  props
) => (
  <DndProvider backend={HTML5Backend}>
    <DragAndDropImportNotebook {...props}>
      <span css={css(p16Regular)}>drop here</span>
    </DragAndDropImportNotebook>
  </DndProvider>
);
