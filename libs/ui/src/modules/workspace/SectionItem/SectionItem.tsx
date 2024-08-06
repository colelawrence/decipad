/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { useDrop } from 'react-dnd';
import { cssVar, transparency, transparencyHex } from '../../../primitives';
import { Anchor, DNDItemTypes } from '../../../utils';

import * as Styled from './styles';
import { OpaqueColor } from '@decipad/utils';
import { droppablePatternStyles } from 'libs/ui/src/styles/droppablePattern';

type DNDType = {
  target: string;
  id: string;
};

export type SectionItemProps = {
  readonly children: ReactNode;
  readonly color: OpaqueColor | string;
  readonly MenuComponent: ReactNode;
  readonly dndInfo: DNDType;
  readonly isActive: boolean;
  readonly href: string;
};

export const SectionItem = ({
  children,
  dndInfo,
  MenuComponent,
  isActive = false,
  href,
  color = cssVar('backgroundDefault'),
}: SectionItemProps): ReturnType<FC> => {
  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: DNDItemTypes.ICON,
      drop: () => ({ id: dndInfo?.id }),
      canDrop: () => {
        return !!dndInfo && dndInfo.target === DNDItemTypes.ICON;
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
        canDrop: !!monitor.canDrop(),
      }),
    }),
    [dndInfo]
  );

  const weakestColor =
    typeof color === 'string'
      ? transparencyHex(color, 0.08)
      : transparency(color, 0.08).rgba;
  const weakColor =
    typeof color === 'string'
      ? transparencyHex(color, 0.16)
      : transparency(color, 0.16).rgba;
  const strongColor =
    typeof color === 'string'
      ? transparencyHex(color, 0.4)
      : transparency(color, 0.4).rgba;
  return (
    <Styled.ItemWrapper
      ref={drop}
      css={[
        canDrop && droppablePatternStyles(weakColor, weakestColor),
        canDrop &&
          isOver &&
          css({
            backgroundColor: strongColor,
          }),
        isActive &&
          css({
            backgroundColor: weakColor,
          }),
      ]}
      color={weakColor}
    >
      <Anchor href={href}>{children}</Anchor>
      {MenuComponent}
    </Styled.ItemWrapper>
  );
};
