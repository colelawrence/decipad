import { PlatePluginComponent } from '@udecode/plate-core';
import { Bubble } from './Bubble.component';

export const BubbleLeaf: PlatePluginComponent = (props) => {
  const { leaf, attributes } = props;
  let { children } = props;

  if ((leaf as any).bubble) {
    children = <Bubble {...props} />;
  }

  return <span {...attributes}>{children}</span>;
};
