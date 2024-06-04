import { pluralize } from '@decipad/language-units';
import { FC, ReactNode, useMemo, useState } from 'react';
import { Avatar, Tooltip } from '../../../shared/atoms';
import { CaretDown, CaretUp } from '../../../icons';
import * as Popover from '@radix-ui/react-popover';
import * as Styled from './styles';

type WorkspaceSelectorProps = {
  readonly name: string;
  readonly membersCount: number;
  readonly isPremium: boolean;
  readonly MenuComponent: ReactNode;
  readonly plan?: string | null;
};

export const WorkspaceSelector: FC<WorkspaceSelectorProps> = ({
  name,
  membersCount,
  isPremium,
  plan,
  MenuComponent,
}): ReturnType<FC> => {
  const [open, setOpen] = useState(false);

  // Show tooltip on truncated name
  const isLongName = useMemo(() => name.length > 20, [name]);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Styled.SelectorButton
          isSelected={open}
          animate={open ? { scale: 0.95 } : { scale: 1 }}
          data-testid="workspace-selector-button"
        >
          <Styled.Avatar>
            <Avatar roundedSquare useSecondLetter={false} name={name} />
          </Styled.Avatar>
          <Styled.Profile>
            {isLongName ? (
              <Tooltip trigger={<Styled.Name>{name}</Styled.Name>}>
                {name}
              </Tooltip>
            ) : (
              <Styled.Name>{name}</Styled.Name>
            )}
            <Styled.Description>
              {membersCount === 1
                ? 'Private'
                : `${membersCount} ${pluralize('member', membersCount)}`}
              {plan && (
                <Styled.Badge isPremium={isPremium}>{plan}</Styled.Badge>
              )}
            </Styled.Description>
          </Styled.Profile>

          <Styled.ToggleButton>
            {open ? <CaretUp /> : <CaretDown />}
          </Styled.ToggleButton>
        </Styled.SelectorButton>
      </Popover.Trigger>
      <Popover.Portal>
        {open && (
          <Popover.Content sideOffset={8} forceMount asChild>
            <Styled.MenuWrapper
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 0, opacity: 0 }}
            >
              {MenuComponent}
            </Styled.MenuWrapper>
          </Popover.Content>
        )}
      </Popover.Portal>
    </Popover.Root>
  );
};
