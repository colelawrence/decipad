/* eslint decipad/css-prop-named-variable: 0 */
import { FC } from 'react';
import { EditItemsOptions, SelectItem, SelectItems } from '../../molecules';
import { cssVar, p14Medium } from '../../../primitives';

type DropdownMenuGroupProps = EditItemsOptions & {
  readonly items: Array<SelectItems>;
  readonly title?: string;
  readonly isEditingAllowed?: boolean;
  readonly focusedId?: string;
  readonly selectedId?: string;
};

export const DropdownMenuGroup: FC<DropdownMenuGroupProps> = ({
  items,
  title,
  isEditingAllowed = false,
  focusedId,
  selectedId,
  ...itemProps
}) => {
  return (
    <div
      css={{ padding: '4px 4px' }}
      role={title ? 'group' : undefined}
      aria-label={title}
    >
      {title && (
        <p
          css={[
            p14Medium,
            {
              color: cssVar('textSubdued'),
            },
          ]}
        >
          {title}
        </p>
      )}
      {items.map((item, i) => (
        <SelectItem
          key={`${item.item}-${i}`}
          item={item}
          isEditAllowed={isEditingAllowed}
          focused={item.id === focusedId}
          selected={item.id === selectedId}
          {...itemProps}
        />
      ))}
    </div>
  );
};
