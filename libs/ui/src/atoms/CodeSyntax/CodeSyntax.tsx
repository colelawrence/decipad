import { css } from '@emotion/react';
import { PlatePluginComponent } from '@udecode/plate';
import { cssVar, setCssVar, p32Medium } from '../../primitives';

const leafStylesByTokenType = {
  number: css(p32Medium, {
    ...setCssVar('currentTextColor', cssVar('strongTextColor')),
  }),
  identifier: css(p32Medium, {
    ...setCssVar('currentTextColor', cssVar('weakTextColor')),
  }),
};

type TokenType = keyof typeof leafStylesByTokenType;

export const CodeSyntax: PlatePluginComponent = ({
  attributes,
  children,
  leaf,
}) => {
  const leafStyle = leafStylesByTokenType[leaf.tokenType as TokenType];
  return (
    <span {...attributes} css={leafStyle}>
      {children}
    </span>
  );
};
