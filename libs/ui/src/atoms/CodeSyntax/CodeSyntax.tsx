import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { cssVar, p14Medium, p24Medium, setCssVar } from '../../primitives';

const leafStylesByTokenType = {
  number: css(p24Medium, {
    fontSize: 24,
    ...setCssVar('currentTextColor', cssVar('strongTextColor')),
  }),
  date: css(p24Medium, {
    ...setCssVar('currentTextColor', cssVar('strongTextColor')),
  }),
  identifier: css(p14Medium, {
    ...setCssVar('currentTextColor', cssVar('weakTextColor')),
  }),
  string: css(p24Medium, {
    ...setCssVar('currentTextColor', cssVar('strongTextColor')),
  }),
  ws: undefined,
};

export type TokenType = keyof typeof leafStylesByTokenType;

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
