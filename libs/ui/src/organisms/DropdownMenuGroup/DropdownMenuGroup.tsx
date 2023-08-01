/* eslint decipad/css-prop-named-variable: 0 */
import { FC } from 'react';
import { EditItemsOptions, SelectItem, SelectItems } from '../../atoms';
import { cssVar, p14Medium } from '../../primitives';

type DropdownMenuGroupProps = EditItemsOptions & {
  readonly items: Array<SelectItems>;
  readonly title?: string;
  readonly isEditingAllowed?: boolean;
  readonly focusedItem?: number;
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
              color: cssVar('textSubdued'),
            },
          ]}
        >
          {title}
        </p>
      )}
      {items.map((elem, i) => (
        <SelectItem
          key={`${elem.item}-${i}`}
          item={elem}
          isEditAllowed={isEditingAllowed}
          {...itemProps}
        />
      ))}
    </div>
  );
};
