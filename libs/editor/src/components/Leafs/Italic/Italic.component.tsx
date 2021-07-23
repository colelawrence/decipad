import styled from '@emotion/styled';
import { SlatePluginComponent } from '@udecode/slate-plugins';

const Leaf = styled('span')({
  fontStyle: 'italic',
});

export const Italic: SlatePluginComponent = ({ attributes, children }) => {
  return <Leaf {...attributes}>{children}</Leaf>;
};
