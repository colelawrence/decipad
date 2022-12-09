import { FC } from 'react';
import { EditItemsOptions, SelectItem, SelectItems } from '../../atoms';
import { cssVar, p14Medium } from '../../primitives';

type DropdownMenuGroupProps = EditItemsOptions & {
  readonly items: Array<SelectItems>;
  readonly title?: string;
  readonly isEditingAllowed?: boolean;
};

export const DropdownMenuGroup: FC<DropdownMenuGroupProps> = ({
  items,
  title,
  isEditingAllowed = false,
  ...itemProps
}) => {
  return (
    <div css={{ padding: '4px 4px' }}>
      {title && (
        <p
          css={[
            p14Medium,
            {
              color: cssVar('weakTextColor'),
            },
          ]}
        >
          {title}
        </p>
      )}
      {items.map((i) => (
        <SelectItem
          key={i.item}
          item={i}
          isEditAllowed={isEditingAllowed}
          {...itemProps}
        />
      ))}
    </div>
  );
};
