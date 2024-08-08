/* eslint-disable decipad/css-prop-named-variable */
import { FC } from 'react';
import { Folder } from '../../icons';
import { hexToOpaqueColor } from '../../primitives';
import { Divider } from '../../shared';
import { colorSwatches, DNDItemTypes } from '../../utils';
import { NavigationList } from '../workspace/NavigationList/NavigationList';
import { SectionItem } from '../workspace/SectionItem/SectionItem';
import * as Styled from './styles';
import type { NavigationSidebarProps } from './types';

export const minWidthForItemStyles = { minWidth: '132px' };

export const NavigationSidebar: FC<NavigationSidebarProps> = ({
  sections,
  folderName,
  numberCatalog,
}) => {
  return (
    <Styled.NavigationSidebarWrapperStyles data-testid="editor-navigation-bar">
      <Styled.WorkspaceTitle>{folderName}</Styled.WorkspaceTitle>
      <NavigationList>
        {[
          sections.map((section) => {
            const selected = false;
            return (
              <SectionItem
                ident={0}
                href=""
                dndInfo={{
                  target: DNDItemTypes.ICON,
                  id: section.id,
                }}
                isActive={selected}
                color={
                  hexToOpaqueColor(section.color) || colorSwatches.Catskill.base
                }
                key={`section-item-${section.id}`}
                MenuComponent={undefined}
              >
                <Styled.ItemWrapper>
                  <Styled.IconWrapper color={section.color}>
                    <Folder />
                  </Styled.IconWrapper>
                  <Styled.TextWrapper>{section.name}</Styled.TextWrapper>
                </Styled.ItemWrapper>
              </SectionItem>
            );
          }),
        ]}
      </NavigationList>
      <div css={{ padding: '10px 0' }}>
        <Divider />
      </div>
      <Styled.WorkspaceTitle>Data</Styled.WorkspaceTitle>
      {numberCatalog}
    </Styled.NavigationSidebarWrapperStyles>
  );
};
