import React from 'react';
import { RenderLeafProps } from 'slate-react';
import { Bubble } from './Bubble.component';

export const BubbleLeaf = (props: RenderLeafProps): JSX.Element => {
  const { leaf, attributes } = props;
  let { children } = props;

  if ((leaf as any).bubble) {
    children = <Bubble {...props} />;
  }

  return <span {...attributes}>{children}</span>;
};
