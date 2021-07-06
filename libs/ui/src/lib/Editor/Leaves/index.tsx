import { Text } from '@chakra-ui/react';

import { RenderLeafProps } from 'slate-react';
import { Bold } from './Bold/Bold.component';
import { Highlight } from './Highlight/Highlight.component';
import { Italic } from './Italic/Italic.component';
import { StrikeThrough } from './StrikeThrough/StrikeThrough.component';
import { Underline } from './Underline/Underline.component';

export const Leaves = (props: RenderLeafProps): JSX.Element => {
  let { children } = props;
  const { leaf, attributes } = props;

  if (leaf.bold) {
    children = <Bold {...props} />;
  }

  if (leaf.italic) {
    children = <Italic {...props} />;
  }

  if (leaf.underline) {
    children = <Underline {...props} />;
  }

  if (leaf.strikethrough) {
    children = <StrikeThrough {...props} />;
  }

  if (leaf.highlight) {
    children = <Highlight {...props} />;
  }

  return (
    <Text as="span" {...attributes}>
      {children}
    </Text>
  );
};
