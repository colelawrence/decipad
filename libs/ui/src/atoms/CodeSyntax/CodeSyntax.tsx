import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import {
  cssVar,
  p24Medium,
  p32Medium,
  setCssVar,
  smallScreenQuery,
} from '../../primitives';

const leafStylesByTokenType = {
  number: css(p32Medium, {
    ...setCssVar('currentTextColor', cssVar('strongTextColor')),
    [smallScreenQuery]: p24Medium,
  }),
  identifier: css(p32Medium, {
    ...setCssVar('currentTextColor', cssVar('weakTextColor')),
    [smallScreenQuery]: p24Medium,
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
