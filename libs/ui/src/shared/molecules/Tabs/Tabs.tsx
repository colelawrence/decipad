/* eslint decipad/css-prop-named-variable: 0 */
import { SerializedStyles, css } from '@emotion/react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type FC,
  type ReactNode,
  useEffect,
  ComponentProps,
} from 'react';
import { cssVar, p13Medium } from '../../../primitives';
import { Tooltip } from '../../atoms';

const tabsListStyles = (fullWidth: boolean) =>
  css({
    width: fullWidth ? '100%' : 'auto',
    padding: '2px',
    height: 'fit-content',
    backgroundColor: cssVar('backgroundMain'),
    border: `1px solid ${cssVar('borderSubdued')}`,
    borderRadius: 8,
    gap: 2,
    display: 'flex',
  });

const tabsTriggerStyles = (isSelected: boolean) =>
  css(
    {
      gridRow: 1,
      borderRadius: '6px',
      display: 'flex',
      justifyContent: 'center',
      flex: 1,
      flexDirection: 'row',
      gap: 4,
      alignItems: 'center',
      minHeight: '28px',
      padding: '2px 12px',
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
    },
    !isSelected && {
      color: cssVar('iconColorDefault'),
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

const ActiveTabContext = createContext({
  activeTab: '',
  setActiveTab: (_: string) => {},
});

type TabsRootProps<T extends string> = {
  children: ReactNode;
  defaultValue?: T;
  onValueChange?: (value: T) => void;
  styles?: SerializedStyles | SerializedStyles[];
};

export function TabsRoot<T extends string>({
  children,
  styles,
  defaultValue = '' as T,
  onValueChange,
}: TabsRootProps<T>): ReturnType<FC> {
  const [value, setValue] = useState(defaultValue);
  const valueObj = { activeTab: value, setActiveTab: setValue };

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const setValueForAll = useCallback(
    (val: T) => {
      onValueChange?.(val);
      setValue(val);
    },
    [onValueChange]
  );

  return (
    <ActiveTabContext.Provider
      value={
        valueObj as unknown as ComponentProps<
          typeof ActiveTabContext.Provider
        >['value']
      }
    >
      <TabsPrimitive.Root
        css={styles}
        value={value}
        onValueChange={setValueForAll as (_: string) => void}
      >
        {children}
      </TabsPrimitive.Root>
    </ActiveTabContext.Provider>
  );
}

type TabsListProps = {
  readonly fullWidth?: boolean;
  readonly children: ReactNode;
};

export const TabsList: FC<TabsListProps> = ({
  children,
  fullWidth = false,
}) => (
  <TabsPrimitive.List css={tabsListStyles(fullWidth)}>
    {children}
  </TabsPrimitive.List>
);

type Trigger = {
  readonly label: string;
  readonly tooltip?: string;
  readonly icon?: ReactNode;
  readonly children?: ReactNode;
  readonly disabled?: boolean;
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
  const { children, icon, label, disabled, tooltip } = trigger;
  const { activeTab } = useContext(ActiveTabContext);
  const selected = name === activeTab;

  return (
    <TabsPrimitive.Trigger
      data-testid={testId}
      key={name}
      value={name}
      disabled={disabled}
      css={tabsTriggerStyles(!!selected)}
    >
      {children || (
        <>
          {icon}

          {tooltip ? (
            <Tooltip
              trigger={
                <span css={tabsTriggerTextStyles(!!selected)}>{label}</span>
              }
            >
              {tooltip}
            </Tooltip>
          ) : (
            <span css={tabsTriggerTextStyles(!!selected)}>{label}</span>
          )}
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
