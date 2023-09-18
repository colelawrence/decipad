/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { cssVar, p13Medium } from '../../primitives';
import * as TabsPrimitive from '@radix-ui/react-tabs';

const tabsListStyles = css({
  width: '100%',
  padding: '2px',
  height: 'fit-content',
  backgroundColor: cssVar('backgroundMain'),
  border: `1px solid ${cssVar('borderSubdued')}`,
  borderRadius: 8,
  gap: 2,
  display: 'grid',
  gridAutoColumns: 'minmax(0, 1fr)',
});

const tabsTriggerStyles = (isSelected: boolean) =>
  css(
    {
      gridRow: 1,
      borderRadius: '6px',
      display: 'flex',
      justifyContent: 'center',
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      padding: '2px',
      backgroundColor: cssVar('backgroundMain'),
      color: cssVar('textSubdued'),

      '&:hover': {
        backgroundColor: cssVar('backgroundDefault'),
        color: cssVar('textDefault'),
      },
    },
    isSelected && {
      backgroundColor: cssVar('backgroundHeavy'),
      color: cssVar('textDefault'),

      '&:hover': {
        backgroundColor: cssVar('backgroundHeavy'),
        color: cssVar('textDefault'),
      },
    }
  );

const tabsTriggerTextStyles = (isSelected: boolean) =>
  css(p13Medium, [
    {
      color: cssVar('textSubdued'),
      whiteSpace: 'nowrap',
      paddingTop: '1px',
      ':hover': {
        color: cssVar('textDefault'),
      },
    },
    isSelected && {
      color: cssVar('textDefault'),
    },
  ]);

const tabsContentStyles = css({
  width: '100%',
});

export const TabsRoot = TabsPrimitive.Root;

type TabsListProps = {
  readonly children: ReactNode;
};

export const TabsList: FC<TabsListProps> = ({ children }) => (
  <TabsPrimitive.List css={tabsListStyles}>{children}</TabsPrimitive.List>
);

type Trigger = {
  readonly label: string;
  readonly tooltip?: string;
  readonly icon?: ReactNode;
  readonly children?: ReactNode;
  readonly disabled?: boolean;
  readonly selected?: boolean;
  readonly onClick?: () => void;
};

type TabsTriggerProps = {
  readonly name: string;
  readonly trigger: Trigger;
  readonly testId?: string;
};

export const TabsTrigger: FC<TabsTriggerProps> = ({
  name,
  trigger,
  testId,
}) => {
  const { children, icon, label, disabled, selected, onClick } = trigger;
  return (
    <TabsPrimitive.Trigger
      data-testid={testId}
      key={name}
      value={name}
      disabled={disabled}
      data-state={selected ? 'active' : undefined}
      onClick={onClick}
      css={tabsTriggerStyles(!!selected)}
    >
      {children || (
        <>
          <span>{icon}</span>
          <span css={tabsTriggerTextStyles(!!selected)}>{label}</span>
        </>
      )}
    </TabsPrimitive.Trigger>
  );
};

type TabsContentProps = {
  readonly name: string;
  readonly children: ReactNode;
};

export const TabsContent: FC<TabsContentProps> = ({ name, children }) => (
  <TabsPrimitive.Content css={tabsContentStyles} key={name} value={name}>
    {children}
  </TabsPrimitive.Content>
);
