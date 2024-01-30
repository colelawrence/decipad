import { render } from '@testing-library/react';
import { EditorBlock } from './EditorBlock';

it('renders the children', () => {
  const { container } = render(
    <EditorBlock blockKind="paragraph">children</EditorBlock>
  );
  expect(container).toHaveTextContent('children');
});
