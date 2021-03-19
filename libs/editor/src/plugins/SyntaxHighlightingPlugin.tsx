import { Text as ChakraText } from '@chakra-ui/react';
import { SlatePlugin } from '@udecode/slate-plugins';
import Prism, { Token } from 'prismjs';
import React from 'react';
import { Editor, Node, Path, Range, Text } from 'slate';
import { RenderLeafProps } from 'slate-react';

const getLength = (token: string | Token) => {
  if (typeof token === 'string') {
    return token.length;
  } else if (typeof token.content === 'string') {
    return token.content.length;
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (token.content as any).reduce(
      (l: string | Token, t: string | Token) => l + getLength(t),
      0
    );
  }
};

export const renderSyntaxHighlighting = (editor: Editor) => ([node, path]: [
  node: Node,
  path: Path
]): Range[] => {
  const ranges: Range[] = [];

  if (node === editor) return ranges;

  const [parentNode] = Editor.parent(editor, path);

  if (!parentNode || parentNode.type !== 'code_block') return ranges;

  if (!Text.isText(node)) {
    return ranges;
  }

  const tokens = Prism.tokenize(node.text, Prism.languages['javascript']);
  let start = 0;

  for (const token of tokens) {
    const length = getLength(token);
    const end = start + length;
    if (typeof token !== 'string') {
      ranges.push({
        [token.type]: true,
        anchor: { path, offset: start },
        focus: { path, offset: end },
      });
    }

    start = end;
  }

  return ranges;
};

type SpanProps = RenderLeafProps & {
  color: string;
};

const Span = ({ color, attributes, children }: SpanProps) => {
  return (
    <ChakraText as="span" color={color} {...attributes}>
      {children}
    </ChakraText>
  );
};

const CodeLeaf = (props: RenderLeafProps): JSX.Element => {
  const { leaf, attributes } = props;
  let { children } = props;

  if (leaf.comment) {
    children = <Span color="slategray" {...props} />;
  }

  if (leaf.operator || leaf.url) {
    children = <Span color="#00a1ec" {...props} />;
  }

  if (leaf.keyword) {
    children = <Span color="#ff8822" {...props} />;
  }

  if (leaf.variable || leaf.regex) {
    children = <Span color="#e90" {...props} />;
  }

  if (
    leaf.number ||
    leaf.boolean ||
    leaf.tag ||
    leaf.constant ||
    leaf.symbol ||
    leaf.attr ||
    leaf.selector
  ) {
    children = <Span color="#905" {...props} />;
  }

  if (leaf.punctuation) {
    children = <Span color="#ff994a" {...props} />;
  }

  if (leaf.string || leaf.char) {
    children = <Span color="#78b600" {...props} />;
  }

  if (leaf.function || leaf.class) {
    children = <Span color="#00a1ec" {...props} />;
  }

  return (
    <ChakraText as="span" {...attributes}>
      {children}
    </ChakraText>
  );
};

export const SyntaxHighlightingPlugin = (): SlatePlugin => ({
  renderLeaf: (props: RenderLeafProps) => <CodeLeaf {...props} />,
  decorate: ([node, path], editor) =>
    renderSyntaxHighlighting(editor)([node, path]),
});
