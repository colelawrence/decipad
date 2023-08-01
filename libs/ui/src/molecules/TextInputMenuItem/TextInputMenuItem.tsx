import { css } from '@emotion/react';
import { ChangeEvent, FC, PropsWithChildren, useCallback, useRef } from 'react';
import { justStopPropagation } from '@decipad/react-utils';
import { Label, MenuItem } from '../../atoms';
import { cssVar, p13Medium } from '../../primitives';
import { menu } from '../../styles';

const menuItemStyles = css({
  background: cssVar('backgroundMain'),

  display: 'flex',

  margin: `calc(-1 * ${menu.itemPadding})`,
});

const inputStyles = css(p13Medium, {
  ':focus-within': {},
  background: cssVar('backgroundDefault'),
  borderRadius: '6px',

  // Make input adjust alongside button
  width: '180px',
});

interface TextInputMenuItemProps {
  readonly onChange: (newValue: string) => void;
  readonly placeholder?: string;
  readonly value: string;
}

export const TextInputMenuItem: FC<
  PropsWithChildren<TextInputMenuItemProps>
> = ({
  value,
  onChange,
  placeholder = 'Insert a JSON Path Expression',
  children,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const onInternalChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  return (
    <MenuItem onFocus={() => inputRef.current?.focus()}>
      <div css={menuItemStyles}>
        <Label
          renderContent={() => (
            <input
              css={inputStyles}
              defaultValue={value}
              // Prevent propagation to the MenuItem which will try to select itself
              // as an option and close the dropdown
              onClick={justStopPropagation}
              ref={inputRef}
              onChange={onInternalChange}
              onMouseLeave={() => inputRef.current?.focus()}
              placeholder={placeholder}
            />
          )}
        >
          {children}
        </Label>
      </div>
    </MenuItem>
  );
};
