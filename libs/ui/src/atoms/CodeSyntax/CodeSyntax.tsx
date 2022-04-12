import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { cssVar, setCssVar, p32Medium } from '../../primitives';

const leafStylesByTokenType = {
  number: css(p32Medium, {
    ...setCssVar('currentTextColor', cssVar('strongTextColor')),
  }),
  identifier: css(p32Medium, {
    ...setCssVar('currentTextColor', cssVar('weakTextColor')),
  }),
  ws: undefined,
};

type TokenType = keyof typeof leafStylesByTokenType;

interface CodeSyntaxProps {
  variant: TokenType;
  children?: ReactNode;
}

export const CodeSyntax = ({
  variant,
  children,
}: CodeSyntaxProps): ReturnType<FC> => {
  const leafStyle = leafStylesByTokenType[variant];
  return <span css={leafStyle}>{children}</span>;
};
