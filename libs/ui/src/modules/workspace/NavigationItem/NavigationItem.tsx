/* eslint decipad/css-prop-named-variable: 0 */
import { FC, ReactNode, useState } from 'react';

import * as Collapsible from '@radix-ui/react-collapsible';

import { useEventNoEffect } from '../../../utils/useEventNoEffect';
import { NavigationList } from '../NavigationList/NavigationList';
import * as Styled from './styles';
import { CaretDown, CaretUp } from 'libs/ui/src/icons';

export type NavigationItemProps = {
  readonly children: ReactNode | ReactNode[];
  readonly level?: number;
} & (
  | {
      readonly items?: never;
      readonly isActive?: boolean;
      readonly href: string;
      readonly onClick?: never;
    }
  | {
      readonly items?: never;
      readonly isActive?: boolean;
      readonly href?: never;
      readonly onClick: () => void;
    }
  | {
      readonly items: ReactNode | ReactNode[];
      readonly isActive?: never;
      readonly href?: string;
      readonly onClick?: () => void;
    }
);

export const NavigationItem = ({
  children,
  items,
  isActive = false,
  href,
  onClick,
  level = 0,
}: NavigationItemProps): ReturnType<FC> => {
  const onButtonClick = useEventNoEffect(onClick);

  const [open, setOpen] = useState(false);

  if (items) {
    return (
      <Collapsible.Root asChild open={open} onOpenChange={setOpen}>
        <Styled.CollapsibleContainer>
          <Collapsible.Trigger asChild>
            {onClick ? (
              <Styled.ItemButton onClick={onClick} level={level}>
                {children}

                <Styled.CollapsibleIcon>
                  {open ? <CaretUp /> : <CaretDown />}
                </Styled.CollapsibleIcon>
              </Styled.ItemButton>
            ) : (
              <Styled.ItemAnchor
                href={href}
                activeStyles={Styled.activeItemStyles}
                level={level}
                exact={true}
              >
                {children}
                <Styled.CollapsibleIcon>
                  {open ? <CaretUp /> : <CaretDown />}
                </Styled.CollapsibleIcon>
              </Styled.ItemAnchor>
            )}
          </Collapsible.Trigger>
          <Collapsible.Content asChild>
            <NavigationList level={level + 1}>{items}</NavigationList>
          </Collapsible.Content>
        </Styled.CollapsibleContainer>
      </Collapsible.Root>
    );
  }

  if (onClick) {
    return (
      <Styled.ItemButton
        onClick={onButtonClick}
        isActive={isActive}
        level={level}
      >
        {children}
      </Styled.ItemButton>
    );
  }

  return (
    <Styled.ItemAnchor
      href={href}
      exact={true}
      activeStyles={Styled.activeItemStyles}
      level={level}
    >
      {children}
    </Styled.ItemAnchor>
  );
};
