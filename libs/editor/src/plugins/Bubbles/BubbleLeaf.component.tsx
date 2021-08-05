import { PlatePluginComponent } from '@udecode/plate';
import { Bubble } from './Bubble.component';

export const BubbleLeaf: PlatePluginComponent = (props) => {
  const { leaf, attributes } = props;
  let { children } = props;

  // TODO make safe or at least cast to a proper leaf type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((leaf as any).bubble) {
    children = <Bubble {...props} />;
  }

  return <span {...attributes}>{children}</span>;
};
