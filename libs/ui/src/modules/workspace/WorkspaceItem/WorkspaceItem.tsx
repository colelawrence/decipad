/* eslint decipad/css-prop-named-variable: 0 */
import { noop } from '@decipad/utils';
import { FC, useCallback, useMemo } from 'react';
import { Avatar, Tooltip } from '../../../shared/atoms';

import { isLocalhostProPlan } from 'libs/ui/src/utils';
import pluralize from 'pluralize';
import { Check } from '../../../icons';
import * as Styled from './styles';

export interface WorkspaceItemProps {
  readonly id: string;
  readonly name: string;
  readonly isActive: boolean;
  readonly isPremium: boolean;
  readonly membersCount: number;
  readonly plan?: string | null;
  readonly onSelect: (id: string) => void;
}

export const WorkspaceItem = ({
  id,
  name,
  isPremium,
  isActive,
  plan,
  membersCount,
  onSelect = noop,
}: WorkspaceItemProps): ReturnType<FC> => {
  const handleNavigate = useCallback(() => {
    onSelect(id);
  }, [id, onSelect]);

  // Show tooltip on truncated name
  const isLongName = useMemo(() => name.length > 20, [name]);
  const isLocalhostPro = isLocalhostProPlan({
    isPremium,
    planName: plan || '',
  });
  return (
    <Styled.ItemButton isSelected={isActive} onClick={handleNavigate}>
      <Styled.Avatar>
        <Avatar roundedSquare useSecondLetter={false} name={name} />
      </Styled.Avatar>
      <Styled.Profile>
        {isLongName ? (
          <Tooltip
            trigger={
              <Styled.Name data-testid="workspace-picker">{name}</Styled.Name>
            }
          >
            {name}
          </Tooltip>
        ) : (
          <Styled.Name data-testid="workspace-picker">{name}</Styled.Name>
        )}
        <Styled.Description>
          {membersCount === 1
            ? 'Private'
            : `${membersCount} ${pluralize('member', membersCount)}`}
          {plan && (
            <Styled.Badge isPremium={isLocalhostPro || isPremium}>
              {isLocalhostPro ? 'Pro (Legacy)' : plan}
            </Styled.Badge>
          )}
        </Styled.Description>
      </Styled.Profile>

      <Styled.Icon>{isActive && <Check />}</Styled.Icon>
    </Styled.ItemButton>
  );
};
