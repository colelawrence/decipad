import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { p14Medium, p24Medium } from '../../../primitives';
import { useSwatchColor } from 'libs/ui/src/utils';
import { AvailableSwatchColor } from '@decipad/editor-types';

const leafStylesByTokenType = {
  number: css(p24Medium, {
    fontSize: 24,
  }),
  date: css(p24Medium),
  identifier: css(p14Medium),
  string: css(p24Medium),
  ws: undefined,
};

export type TokenType = keyof typeof leafStylesByTokenType;

export interface CodeSyntaxProps {
  variant: TokenType;
  color?: AvailableSwatchColor;
  children?: ReactNode;
}

export const CodeSyntax = ({
  variant,
  children,
  color: colorProp = 'Catskill',
}: CodeSyntaxProps): ReturnType<FC> => {
  const swatchColor = useSwatchColor(colorProp, 'vivid', 'base');
  const leafStyle = leafStylesByTokenType[variant];

  const combinedStyle = css([
    leafStyle,
    {
      color: swatchColor.hex,
    },
  ]);

  return <span css={combinedStyle}>{children}</span>;
};
