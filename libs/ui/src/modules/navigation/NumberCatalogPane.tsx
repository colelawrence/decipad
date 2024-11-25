/* eslint-disable decipad/css-prop-named-variable */
import { CaretDown, CaretRight, Add } from '../../icons';
import { Tooltip } from '../../shared';
import { ClientEventsContext } from '@decipad/client-events';
import * as Styled from './styles';
import styled from '@emotion/styled';
import { Panel } from 'react-resizable-panels';
import { deciOverflowYStyles } from '../../styles/scrollbars';
import { FC, useContext, useState } from 'react';
import { NumberCatalogPaneProps } from './types';

const SectionWrapper = styled(Panel)(deciOverflowYStyles, {
  width: '100%',
  // Panel component sets an overflow: hidden internally...
  overflow: 'auto !important',
});

export const NumberCatalogPane: FC<NumberCatalogPaneProps> = ({
  numberCatalog,
  toggleAddNewVariable,
}) => {
  const [isNotebookDataExpanded, setIsNotebookDataExpanded] = useState(true);
  const event = useContext(ClientEventsContext);

  const handleCreateVariable = () => {
    toggleAddNewVariable();
    event({
      segmentEvent: {
        type: 'action',
        action: 'Data Drawer Opened',
        props: {
          analytics_source: 'frontend',
          drawer_trigger: 'sidebar',
        },
      },
    });
  };

  const tooltipTriggerVariable = (
    <Styled.AddButtonWrapper>
      <Styled.IconOuterWrapper highlightBackgroundOnHover={true}>
        <Styled.IconWrapper role="button" onClick={handleCreateVariable}>
          <Add />
        </Styled.IconWrapper>
      </Styled.IconOuterWrapper>
    </Styled.AddButtonWrapper>
  );

  return (
    <SectionWrapper minSize={5}>
      <Styled.NavigationTitleWrapper>
        <Styled.NavigationTitleInnerWrapper
          onClick={() => setIsNotebookDataExpanded(!isNotebookDataExpanded)}
        >
          <Styled.IconOuterWrapper>
            <Styled.IconWrapper>
              {isNotebookDataExpanded ? <CaretDown /> : <CaretRight />}
            </Styled.IconWrapper>
          </Styled.IconOuterWrapper>
          <Styled.NavigationTitle>Notebook Data</Styled.NavigationTitle>
        </Styled.NavigationTitleInnerWrapper>
        <Tooltip side="top" hoverOnly trigger={tooltipTriggerVariable}>
          <Styled.TooltipText>New Variable</Styled.TooltipText>
        </Tooltip>
      </Styled.NavigationTitleWrapper>
      <Styled.ListWrapper>
        {isNotebookDataExpanded && numberCatalog}
      </Styled.ListWrapper>
    </SectionWrapper>
  );
};
