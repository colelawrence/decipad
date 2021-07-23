import styled from '@emotion/styled';
import { SlatePluginComponent } from '@udecode/slate-plugins';

const Leaf = styled('span')({
  fontWeight: 'bold',
});

export const Bold: SlatePluginComponent = ({ attributes, children }) => {
  return <Leaf {...attributes}>{children}</Leaf>;
};
